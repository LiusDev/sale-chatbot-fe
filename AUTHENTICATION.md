# Cơ chế xử lý 401 Authentication

## Tổng quan

Project đã được cập nhật để sử dụng cơ chế xử lý 401 với global state thay vì redirect trực tiếp. Khi API trả về 401, hệ thống sẽ:

1. Bật flag trong global state (Zustand store)
2. Hiển thị dialog yêu cầu đăng nhập lại
3. Tránh hiển thị nhiều dialog cùng lúc

## Các components đã thêm/sửa

### 1. Auth Store (`src/stores/auth.store.ts`)

-   Quản lý state `isAuthDialogOpen`
-   Có cơ chế tránh mở nhiều dialog cùng lúc
-   Functions: `showAuthDialog()`, `hideAuthDialog()`

### 2. Base API (`src/services/base-api.ts`)

-   Đã thay thế `redirect("/auth/login")` bằng `useAuthStore.getState().showAuthDialog()`
-   Khi gặp 401, sẽ trigger global flag

### 3. ReAuthDialog Component (`src/components/re-auth-dialog.tsx`)

-   Dialog hiển thị form đăng nhập lại
-   Sử dụng lại logic đăng nhập từ login page
-   Có thể đóng dialog bằng cách click outside hoặc escape

### 4. Main Layout (`src/app/(main)/layout.tsx`)

-   Đã tích hợp `<ReAuthDialog />` vào layout chính
-   Dialog sẽ xuất hiện trên toàn bộ app khi cần

### 5. Translations (`src/lib/translations.ts`)

-   Đã thêm keys cho session expired: `auth.sessionExpired`, `auth.pleaseSignInAgain`

## Cách hoạt động

1. User thực hiện một API call
2. Nếu server trả về 401:
    - Base API hook sẽ gọi `useAuthStore.getState().showAuthDialog()`
    - Flag `isAuthDialogOpen` được set thành `true`
    - Nếu flag đã bật rồi thì không làm gì (tránh multiple dialogs)
3. ReAuthDialog component sẽ hiện lên
4. User đăng nhập lại thông qua Google OAuth
5. Sau khi đăng nhập thành công, page sẽ reload và user có thể tiếp tục

## Ưu điểm

-   **Không redirect**: User không bị chuyển trang, trải nghiệm mượt mà hơn
-   **Tránh multiple dialogs**: Có cơ chế kiểm tra flag để tránh hiện nhiều dialog cùng lúc
-   **Tái sử dụng logic**: Sử dụng lại code từ login page
-   **Global state**: Dễ quản lý và mở rộng
-   **UX tốt**: User có thể đóng dialog và thử lại sau
