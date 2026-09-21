import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BookOpen, BriefcaseBusiness, CheckCircle2, Clock3, FileQuestion, Microscope, XCircle } from "lucide-react";
import PageHeader from "../components/common/PageHeader.jsx";
import SEO from "../components/common/SEO.jsx";
import { admissionTestGroups, getAdmissionTestByGroup } from "../data/admissionTests.js";
import { institution } from "../data/site.js";

const sessionKey = (group) => `admissionTestSession:${group}`;
const resultKey = (group) => `admissionTestResult:${group}`;
const historyKey = "admissionTestHistory";
const icons = { Microscope, BookOpen, BriefcaseBusiness };

const formatTime = (seconds) => {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
};

const readJson = (key, fallback = null) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

function saveHistory(result) {
  const history = readJson(historyKey, []);
  const next = [result, ...history.filter((item) => item.resultId !== result.resultId)].slice(0, 12);
  localStorage.setItem(historyKey, JSON.stringify(next));
}

function calculateResult(test, session, reason = "manual") {
  const answers = session.answers || {};
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  test.questions.forEach((q) => {
    const answer = answers[q.id];
    if (answer === null || answer === undefined) unanswered += 1;
    else if (answer === q.correctAnswer) correct += 1;
    else incorrect += 1;
  });
  const score = correct;
  const percentage = Math.round((score / test.totalMarks) * 100);
  const endedAt = Date.now();
  const timeUsedSeconds = Math.min(test.durationSeconds, Math.max(0, Math.floor((endedAt - session.startedAt) / 1000)));
  return {
    resultId: `${test.slug}-${endedAt}`,
    testId: test.slug,
    group: test.label,
    candidateName: session.candidateName || "Demo Candidate",
    candidateId: session.candidateId || "DEMO-ADMISSION",
    score,
    totalMarks: test.totalMarks,
    percentage,
    correct,
    incorrect,
    unanswered,
    status: score >= test.passingMarks ? "Passed" : "Failed",
    passingMarks: test.passingMarks,
    startedAt: session.startedAt,
    endedAt,
    timeUsedSeconds,
    totalTimeSeconds: test.durationSeconds,
    answers,
    reason,
    submittedAt: new Date(endedAt).toISOString(),
  };
}

function useTestOrRedirect() {
  const { group } = useParams();
  const navigate = useNavigate();
  const test = getAdmissionTestByGroup(group);
  useEffect(() => {
    if (!test) navigate("/admission-tests", { replace: true });
  }, [test, navigate]);
  return { group, test, navigate };
}

export function AdmissionTestsDashboard() {
  const history = readJson(historyKey, []);
  return (
    <>
      <SEO title="Admission Tests" />
      <PageHeader title="Admission Test" eyebrow="Online MCQ" description="Choose a group and take a demo live MCQ admission test." />
      <section className="section">
        <div className="container test-grid">
          {admissionTestGroups.map((test) => {
            const Icon = icons[test.icon];
            return (
              <article className={`test-card ${test.tone}`} key={test.slug}>
                <div className="test-card-icon"><Icon size={30} /></div>
                <h2>{test.label}</h2>
                <p>{test.totalQuestions} Questions</p>
                <p>{Math.floor(test.durationSeconds / 60)} Minutes</p>
                <p>{test.totalMarks} Marks</p>
                <Link className="btn primary" to={`/admission-tests/${test.slug}`}>Start Test</Link>
              </article>
            );
          })}
        </div>
        <div className="container">
          <section className="my-tests">
            <h2>My Admission Tests</h2>
            {history.length === 0 ? <p>No previous demo tests found on this browser.</p> : history.map((item) => (
              <article className="test-history" key={item.resultId}>
                <div><strong>{item.group} Admission Test</strong><span>Score: {item.score}/{item.totalMarks} • {item.percentage}% • {item.status}</span></div>
                <time>{new Date(item.endedAt).toLocaleDateString()}</time>
                <Link className="btn" to={`/admission-tests/${item.testId}/result`}>View Result</Link>
              </article>
            ))}
          </section>
        </div>
      </section>
    </>
  );
}

export function AdmissionTestGroup() {
  const { group, test } = useTestOrRedirect();
  if (!test) return null;
  return (
    <>
      <SEO title={test.title} />
      <PageHeader title={test.title} eyebrow="Admission Test" description="Enter demo candidate information before reading the examination rules." />
      <section className="section">
        <div className="container test-intake">
          <div className="card">
            <h2>Applicant Information</h2>
            <p>This demo stores candidate and test state only in this browser.</p>
            <form className="form-grid" onSubmit={(event) => {
              event.preventDefault();
              const data = Object.fromEntries(new FormData(event.currentTarget));
              localStorage.setItem(`admissionCandidate:${group}`, JSON.stringify(data));
              location.href = `/admission-tests/${group}/instructions`;
            }}>
              <label>Candidate Name<input name="candidateName" required placeholder="Enter full name" /></label>
              <label>Candidate ID<input name="candidateId" required placeholder="Application or student ID" /></label>
              <button className="btn primary">Continue</button>
            </form>
          </div>
          <div className="card test-summary">
            <h2>{test.label}</h2>
            <p><Clock3 size={18} /> Duration: {Math.floor(test.durationSeconds / 60)} minutes</p>
            <p><FileQuestion size={18} /> Questions: {test.totalQuestions}</p>
            <p><CheckCircle2 size={18} /> Passing Marks: {test.passingMarks}</p>
          </div>
        </div>
      </section>
    </>
  );
}

export function AdmissionTestInstructions() {
  const { group, test, navigate } = useTestOrRedirect();
  if (!test) return null;
  const start = () => {
    const candidate = readJson(`admissionCandidate:${group}`, {});
    const existing = readJson(sessionKey(group));
    const session = existing?.submitted ? null : existing;
    localStorage.setItem(sessionKey(group), JSON.stringify(session || {
      testId: test.slug,
      group: test.slug,
      candidateName: candidate.candidateName || "Demo Candidate",
      candidateId: candidate.candidateId || "DEMO-ADMISSION",
      startedAt: Date.now(),
      durationSeconds: test.durationSeconds,
      answers: {},
      currentIndex: 0,
      warnedFiveMinutes: false,
    }));
    navigate(`/admission-tests/${group}/start`);
  };
  return (
    <>
      <SEO title={`${test.label} Instructions`} />
      <PageHeader title={test.title} eyebrow="Instructions" />
      <section className="section">
        <div className="container exam-rules card">
          <div className="rule-metrics">
            <span>Test Duration: <strong>{Math.floor(test.durationSeconds / 60)} Minutes</strong></span>
            <span>Total Questions: <strong>{test.totalQuestions}</strong></span>
            <span>Total Marks: <strong>{test.totalMarks}</strong></span>
            <span>Marks per Question: <strong>1</strong></span>
          </div>
          <h2>Instructions</h2>
          {[
            "Read every question carefully.",
            "Select one answer for each question.",
            "You can navigate between questions and change answers before submission.",
            "The examination will automatically submit when time expires.",
            "The timer is based on the original start time and survives refresh.",
            "Once submitted, answers cannot be changed.",
          ].map((item) => <p key={item}><CheckCircle2 size={18} /> {item}</p>)}
          <button className="btn primary" onClick={start}>I Understand - Start Test</button>
        </div>
      </section>
    </>
  );
}

export function AdmissionLiveTest() {
  const { group, test, navigate } = useTestOrRedirect();
  const [session, setSession] = useState(() => readJson(sessionKey(group)));
  const [now, setNow] = useState(Date.now());
  const [confirm, setConfirm] = useState(false);
  const [warning, setWarning] = useState(false);

  const remainingSeconds = useMemo(() => {
    if (!session || !test) return 0;
    const deadline = session.startedAt + test.durationSeconds * 1000;
    return Math.max(0, Math.ceil((deadline - now) / 1000));
  }, [session, test, now]);

  const submit = (reason = "manual") => {
    const latest = readJson(sessionKey(group), session);
    const result = calculateResult(test, latest, reason);
    localStorage.setItem(resultKey(group), JSON.stringify(result));
    saveHistory(result);
    localStorage.removeItem(sessionKey(group));
    navigate(`/admission-tests/${group}/result`);
  };

  useEffect(() => {
    if (!test) return;
    if (!session) {
      navigate(`/admission-tests/${group}/instructions`, { replace: true });
      return;
    }
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [session, test, group, navigate]);

  useEffect(() => {
    if (!session || !test) return;
    if (remainingSeconds <= 300 && remainingSeconds > 0 && !session.warnedFiveMinutes) {
      const next = { ...session, warnedFiveMinutes: true };
      setSession(next);
      localStorage.setItem(sessionKey(group), JSON.stringify(next));
      setWarning(true);
    }
    if (remainingSeconds === 0) submit("auto");
  }, [remainingSeconds]);

  if (!test || !session) return null;
  const question = test.questions[session.currentIndex || 0];
  const answered = Object.values(session.answers || {}).filter((value) => value !== null && value !== undefined).length;
  const choose = (optionIndex) => {
    const next = { ...session, answers: { ...session.answers, [question.id]: optionIndex } };
    setSession(next);
    localStorage.setItem(sessionKey(group), JSON.stringify(next));
  };
  const jump = (index) => {
    const next = { ...session, currentIndex: index };
    setSession(next);
    localStorage.setItem(sessionKey(group), JSON.stringify(next));
  };

  return (
    <>
      <SEO title={`${test.label} Live Test`} />
      <section className="section exam-section">
        <div className="container exam-shell">
          <div className="exam-main">
            <div className="exam-top"><strong>{institution.name}</strong><span>{test.label.toUpperCase()} ADMISSION TEST</span></div>
            <div className="question-card">
              <div className="question-meta"><span>Question {session.currentIndex + 1} / {test.totalQuestions}</span><span className="badge">{question.subject} • {question.difficulty}</span></div>
              <h1>{question.question}</h1>
              <div className="option-list">
                {question.options.map((option, index) => (
                  <label className={`option ${session.answers?.[question.id] === index ? "selected" : ""}`} key={option}>
                    <input type="radio" name={question.id} checked={session.answers?.[question.id] === index} onChange={() => choose(index)} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              <div className="exam-actions">
                <button className="btn" disabled={session.currentIndex === 0} onClick={() => jump(session.currentIndex - 1)}>Previous</button>
                <button className="btn" disabled={session.currentIndex === test.totalQuestions - 1} onClick={() => jump(session.currentIndex + 1)}>Next</button>
                <button className="btn primary" onClick={() => setConfirm(true)}>Submit Test</button>
              </div>
            </div>
          </div>
          <aside className="exam-side">
            <div className={`timer ${remainingSeconds <= 300 ? "danger" : ""}`}>{formatTime(remainingSeconds)}</div>
            <p>{answered} answered • {test.totalQuestions - answered} unanswered</p>
            <div className="question-nav">
              {test.questions.map((q, index) => {
                const isCurrent = session.currentIndex === index;
                const isAnswered = session.answers?.[q.id] !== undefined;
                return <button key={q.id} className={`${isCurrent ? "current" : ""} ${isAnswered ? "answered" : ""}`} onClick={() => jump(index)}>{String(index + 1).padStart(2, "0")}</button>;
              })}
            </div>
            <div className="legend"><span>Green answered</span><span>Blue current</span><span>White not answered</span></div>
          </aside>
        </div>
      </section>
      {warning && <Modal title="5 Minutes Remaining" onClose={() => setWarning(false)}><p>Please review unanswered questions and submit before time expires.</p><button className="btn primary" onClick={() => setWarning(false)}>Continue Test</button></Modal>}
      {confirm && <Modal title="Submit Examination?" onClose={() => setConfirm(false)}><p>You have answered {answered} of {test.totalQuestions} questions.</p><p>{test.totalQuestions - answered === 0 ? "You have answered all questions." : `${test.totalQuestions - answered} questions are unanswered.`}</p><div className="actions"><button className="btn" onClick={() => setConfirm(false)}>Cancel</button><button className="btn primary" onClick={() => submit("manual")}>Submit Test</button></div></Modal>}
    </>
  );
}

export function AdmissionTestResult() {
  const { group, test } = useTestOrRedirect();
  const result = readJson(resultKey(group));
  if (!test) return null;
  if (!result) return <MissingResult group={group} />;
  return (
    <>
      <SEO title={`${test.label} Result`} />
      <PageHeader title="Admission Test Result" eyebrow={test.label} />
      <section className="section">
        <div className="container result-layout">
          <div className={`score-card ${result.status.toLowerCase()}`}>
            <p>{result.group}</p>
            <h2>{result.score} / {result.totalMarks}</h2>
            <strong>{result.percentage}%</strong>
            <span>{result.status === "Passed" ? "Test Passed" : "Test Failed"}</span>
          </div>
          <div className="card result-breakdown">
            <p>Correct Answers <strong>{result.correct}</strong></p>
            <p>Incorrect Answers <strong>{result.incorrect}</strong></p>
            <p>Unanswered <strong>{result.unanswered}</strong></p>
            <p>Time Used <strong>{formatTime(result.timeUsedSeconds)}</strong></p>
            <p>Total Time <strong>{formatTime(result.totalTimeSeconds)}</strong></p>
            <div className="actions"><Link className="btn primary" to={`/admission-tests/${group}/review`}>View Answer Review</Link><Link className="btn" to="/admission/online">Back to Admission</Link></div>
          </div>
        </div>
      </section>
    </>
  );
}

export function AdmissionTestReview() {
  const { group, test } = useTestOrRedirect();
  const result = readJson(resultKey(group));
  if (!test) return null;
  if (!result) return <MissingResult group={group} />;
  return (
    <>
      <SEO title={`${test.label} Answer Review`} />
      <PageHeader title="Answer Review" eyebrow={test.label} description="Submitted answers are locked and cannot be changed." />
      <section className="section">
        <div className="container review-list">
          {test.questions.map((q, index) => {
            const answer = result.answers?.[q.id];
            const status = answer === undefined ? "Unanswered" : answer === q.correctAnswer ? "Correct" : "Incorrect";
            return (
              <article className={`review-card ${status.toLowerCase()}`} key={q.id}>
                <h2>Question {String(index + 1).padStart(2, "0")}</h2>
                <p>{q.question}</p>
                <div><strong>Your Answer:</strong> {answer === undefined ? "Not Answered" : q.options[answer]} {status === "Correct" && <CheckCircle2 size={16} />} {status === "Incorrect" && <XCircle size={16} />}</div>
                <div><strong>Correct Answer:</strong> {q.options[q.correctAnswer]} <CheckCircle2 size={16} /></div>
                <span className="badge">{status}</span>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}

export function MyTestsPage() {
  return <AdmissionTestsDashboard />;
}

function MissingResult({ group }) {
  return <><PageHeader title="No Result Found" /><section className="section"><div className="container card"><p>No submitted result was found for this demo test on this browser.</p><Link className="btn primary" to={`/admission-tests/${group}`}>Start Test</Link></div></section></>;
}

function Modal({ title, children, onClose }) {
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card"><button className="modal-close" onClick={onClose}>Close</button><h2>{title}</h2>{children}</div></div>;
}
