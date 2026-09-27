import Swal from "sweetalert2";

const theme = {
  confirmButtonColor: "#0f7a55",
  cancelButtonColor: "#94a3b8",
  color: "#173d33",
  background: "#ffffff",
};

export async function confirmAction({
  title = "Are you sure?",
  text = "This action cannot be undone.",
  confirmText = "Yes, continue",
  cancelText = "Cancel",
  danger = false,
} = {}) {
  const result = await Swal.fire({
    title,
    text,
    icon: danger ? "warning" : "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: true,
    ...theme,
    confirmButtonColor: danger ? "#dc2626" : theme.confirmButtonColor,
  });
  return result.isConfirmed;
}

export function confirmDelete(itemLabel = "this item") {
  return confirmAction({
    title: "Delete this item?",
    text: `${itemLabel} will be permanently removed. This action cannot be undone.`,
    confirmText: "Yes, delete",
    danger: true,
  });
}

export function notifySuccess(message = "Saved successfully.") {
  Swal.fire({
    title: message,
    icon: "success",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    ...theme,
  });
}

export function notifyError(message = "Something went wrong. Please try again.") {
  Swal.fire({
    title: message,
    icon: "error",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    ...theme,
  });
}
