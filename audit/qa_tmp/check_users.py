from django.contrib.auth import get_user_model
U = get_user_model()
for email, pw in [("e2e.headteacher.2026@example.com","E2E_TEST_2026_HeadTeacher!"),("e2e.teacher.physics.2026@example.com","E2E_TEST_2026_Teacher!"),("e2e.student.alpha.2026@example.com","E2E_TEST_2026_Student!"),("demo.teacher09@gmail.com","2633123"),("demo.teacher10@gmail.com","2633123")]:
    u = U.objects.filter(email=email).first()
    print(email, "exists" if u else "MISSING", u and u.is_active, u and u.check_password(pw), u and list(u.roles.values_list("code", flat=True)))
