// Vietnamese translations for the entire application
export const translations = {
	// Common actions
	actions: {
		edit: "Chỉnh sửa",
		delete: "Xóa",
		create: "Tạo mới",
		add: "Thêm",
		save: "Lưu",
		cancel: "Hủy",
		back: "Quay lại",
		upload: "Tải lên",
		search: "Tìm kiếm",
		view: "Xem",
		loading: "Đang tải...",
		submit: "Gửi",
		close: "Đóng",
		next: "Tiếp theo",
		previous: "Trước đó",
		confirm: "Xác nhận",
		continue: "Tiếp tục",
	},

	// Navigation and menu
	navigation: {
		menu: "Menu",
		home: "Trang chủ",
		products: "Sản phẩm",
		playground: "Thử nghiệm",
		channels: "Quản lý kênh",
		dashboard: "Bảng điều khiển",
		backToProducts: "Quay lại sản phẩm",
	},

	// Product related
	products: {
		title: "Nhóm sản phẩm",
		description: "Quản lý các nhóm sản phẩm và tổ chức kho hàng của bạn",
		createProduct: "Tạo sản phẩm",
		createProductGroup: "Tạo nhóm sản phẩm",
		editProduct: "Chỉnh sửa sản phẩm",
		editProductGroup: "Chỉnh sửa nhóm sản phẩm",
		deleteProduct: "Xóa sản phẩm",
		deleteProductGroup: "Xóa nhóm sản phẩm",
		productDetails: "Chi tiết sản phẩm",
		productId: "Mã sản phẩm",
		groupId: "Mã nhóm",
		name: "Tên",
		productDescription: "Mô tả sản phẩm",
		price: "Giá",
		metadata: "Thông tin bổ sung",
		images: "Hình ảnh",
		image: "hình ảnh",
		noImageAvailable: "Không có hình ảnh",
		uploadImages: "Tải lên hình ảnh",
		addNewProduct: "Thêm sản phẩm mới vào nhóm này",
		createNewGroup: "Tạo nhóm sản phẩm mới để tổ chức sản phẩm của bạn",
		enterProductName: "Nhập tên sản phẩm",
		enterGroupName: "Nhập tên nhóm",
		enterProductDescription:
			"Nhập mô tả sản phẩm (để AI hiểu hơn về sản phẩm và đưa ra tư vấn chính xác)",
		enterGroupDescription: "Nhập mô tả nhóm",
		descriptionOptional: "Mô tả (tùy chọn)",
		metadataJson: "Dữ liệu bổ sung (JSON)",
		noImagesSelected:
			"Chưa chọn hình ảnh nào. Nhấp tải lên để thêm hình ảnh.",
		preview: "Xem trước",
		creating: "Đang tạo...",
		createGroup: "Tạo nhóm",
		products: "sản phẩm",
		hasProducts: "Có sản phẩm",
		empty: "Trống",
		deleteWarning:
			"Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn nhóm sản phẩm.",
		cannotDeleteWithProducts: "Không thể xóa nhóm có sản phẩm",
		removeProductsFirst:
			"Vui lòng xóa tất cả sản phẩm khỏi nhóm này trước khi xóa nhóm.",
		deleting: "Đang xóa...",
		deleteGroup: "Xóa nhóm",
		noAdditionalInfo: "Chưa có thông tin bổ sung",
		clickAddToAddInfo: 'Nhấn "Thêm" để thêm thông tin',
		attributePlaceholder: "Thuộc tính (ví dụ: màu sắc)",
		valuePlaceholder: "Giá trị (ví dụ: đỏ, xanh)",
		saveChanges: "Lưu thay đổi",
		saving: "Đang lưu...",
	},

	// Authentication
	auth: {
		welcomeBack: "Chào mừng trở lại",
		signInToAccount: "Đăng nhập vào tài khoản của bạn để tiếp tục",
		continueWithGoogle: "Tiếp tục với Google",
		connecting: "Đang kết nối...",
		failedToConnect:
			"Không thể kết nối với dịch vụ xác thực. Vui lòng thử lại.",
		termsOfService: "Điều khoản dịch vụ",
		privacyPolicy: "Chính sách bảo mật",
		byContining: "Bằng cách tiếp tục, bạn đồng ý với",
		and: "và",
		needHelp: "Cần trợ giúp?",
		contactSupport: "Liên hệ hỗ trợ",
	},

	// Error messages
	errors: {
		somethingWentWrong: "Đã xảy ra lỗi",
		failedToLoad: "Không thể tải",
		failedToLoadProduct: "Không thể tải sản phẩm",
		failedToLoadProductGroups: "Không thể tải nhóm sản phẩm",
		productNotFound: "Không tìm thấy sản phẩm",
		invalidProductId: "Mã sản phẩm không hợp lệ",
		invalidFileType: "Loại tệp không hợp lệ",
		fileTooLarge: "Tệp quá lớn",
		nameRequired: "Tên là bắt buộc",
		nameTooLong: "Tên quá dài",
		priceMustBePositive: "Giá phải là số dương",
		failedToCreateProduct: "Không thể tạo sản phẩm",
		failedToCreateProductGroup: "Không thể tạo nhóm sản phẩm",
		failedToDeleteProductGroup: "Không thể xóa nhóm sản phẩm",
		cannotDeleteGroupWithProducts:
			"Không thể xóa nhóm có sản phẩm. Vui lòng xóa tất cả sản phẩm trước.",
		internalServerError: "Lỗi máy chủ nội bộ",
	},

	// Success messages
	success: {
		productCreated: "Tạo sản phẩm thành công",
		productGroupCreated: "Tạo nhóm sản phẩm thành công",
		productUpdated: "Cập nhật sản phẩm thành công",
		productGroupUpdated: "Cập nhật nhóm sản phẩm thành công",
		productDeleted: "Xóa sản phẩm thành công",
		productGroupDeleted: "Xóa nhóm sản phẩm thành công",
	},

	// Form validation
	validation: {
		required: "Trường này là bắt buộc",
		mustBeNumber: "Phải là số",
		mustBePositive: "Phải là số dương",
		invalidEmail: "Email không hợp lệ",
		tooShort: "Quá ngắn",
		tooLong: "Quá dài",
		invalidFormat: "Định dạng không hợp lệ",
		nameRequired: "Tên là bắt buộc",
		nameTooLong: "Tên quá dài",
		descriptionRequired: "Mô tả sản phẩm là bắt buộc",
		pricePositive: "Giá phải là số dương",
	},

	// General UI
	ui: {
		search: "Tìm kiếm...",
		noResults: "Không có kết quả",
		loading: "Đang tải...",
		tryAgain: "Thử lại",
		refresh: "Làm mới",
		filter: "Lọc",
		sort: "Sắp xếp",
		clear: "Xóa",
		apply: "Áp dụng",
		reset: "Đặt lại",
		showMore: "Hiển thị thêm",
		showLess: "Hiển thị ít hơn",
		selectAll: "Chọn tất cả",
		deselectAll: "Bỏ chọn tất cả",
	},

	// Breadcrumbs
	breadcrumbs: {
		buildingApplication: "Xây dựng ứng dụng",
		dataFetching: "Lấy dữ liệu",
	},

	// App info
	app: {
		name: "Sales Chatbot",
		author: "Tuấn Yên Bái",
	},
}

// Helper function to get nested translation
export function t(key: string): string {
	const keys = key.split(".")
	let value: any = translations

	for (const k of keys) {
		if (value && typeof value === "object" && k in value) {
			value = value[k]
		} else {
			console.warn(`Translation key not found: ${key}`)
			return key // Return the key itself if translation not found
		}
	}

	return typeof value === "string" ? value : key
}

export default translations
