var User = require("./models/user");
var Course = require("./models/course");
var xlsx = require("xlsx");
var mongodb = require("./database/mongoose");
var Survey = require("./models/survey");
var async = require("async");

//TODO: làm view cho gv, hoàn chỉnh thêm xoá sửa cho admin
// tạo acc admin, làm thống kê kết quả
// tổ chức lại code
// dùng BS4 filter để search
//api sử dụng object id

//Init database
/*
Survey.create({name: "Survey 1", items: [
    {
        title: "Cơ sở vật chất",
        contents: [
            "Giảng đường đáp ứng yêu cầu môn học",
            "Các trang thiết bị tại giảng đường đáp ứng yêu cầu giảng dạy và học tập",
        ]
    },
    {
        title: "Môn học",
        contents: [
            "Bạn được hỗ trợ kịp thời trong quá trình học môn này",
            "Mục tiêu của môn học nêu rõ kiến thức và kỹ năng người học cần đạt được",
            "Thời lượng môn học được phân bổ hợp lý cho các hình thức học tập",
            "Các tài liệu phục vụ môn học được cập nhật",
            "Môn học góp phần trang bị kiến thức kỹ năng nghề nghiệp cho bạn"
        ]
    },
    {
        title: "Hoạt dộng giảng dạy của giáo viên",
        contents: [
            "Giảng viên thực hiện đầy đủ nội dung và thời lượng của môn học theo kế hoạch",
            "Giảng vien hướng dẫn bạn phương pháp học tập khi bắt đầu môn học",
            "Phương pháp giảng dạy của giảng viên giúp bạn phát triển tư duy",
            "Giảng viên tạo cơ hội để bạn chủ động tham gia vào quá trình học tập",
            "Giảng viên giúp bạn phát triển kỹ năng làm việc độc lập",
            "Giảng viên rèn luyện cho bạn phương pháp liên hệ giữa các vấn đề trong môn học với thực tiễn",
            "Giảng viên sử dụng hiệu quả phương tiên dạy học",
            "Giảng viên quan tâm giáo dục tư cách, phẩm chất nghề nghiệp của người học",
            "Bạn hiểu những vấn đề được truyền tải trên lớp",
            "Kết quả học tập của người học được đánh giá bằng nhiều hình thức phù hợp với tính chất và đặc thù môn học",
            "Nội dung kiểm tra đánh giá tổng hợp được các kỹ năng mà người học phải đạt theo yêu cầu",
            "Thông tin phản hồi từ kiểm tra đánh giá giúp bạn cải thiện kết quả học tập"
        ]
    }
], isDefault: true}, (err, res) => {
    if(err) throw err;
    console.log(res);
});

User.create({username: "admin", password: "admin", fullname: "Admin", role: "admin"}, (err, ad) => {
    if(err) throw err;
    console.log(ad);
});
*/

// User.findOne({username: 16020936}).populate({path: "courses", populate: {path: "surveys"}}).exec(function(err, user) {
//     console.log(user.courses[0].surveys[0]);
// });

// User.findOne({username: 16020936}).populate("courses", "-_id code name teacher").exec((err, res) => {
//     console.log(res.courses);
// });

// Course.find({}).exec(function(err, courses) {
//     console.log(courses[0].isDone("16020936"));
// });

// User.findOne({username: "16020936"}).exec((err, user) => {
//     if(err) throw err;
//     var data = [];
//     async.each(user.courses, (item, callback) => {
//         Course.findById(item._id).exec((err, course) => {
//             if(err) callback(err);
//             if(course) data.push({
//                 name: course.name,
//                 code: course.code,
//                 teacher: course.teacher,
//                 status: course.isDone(user.username)
//             });
//             callback();
//         });
//     }, (err) => {
//         if(err) throw err;
//         console.log(data);
//     });
// });

// Course.updateOne({code: "INT3306 1"}, {$push: {done: "16020936"}}).exec((err, res) => {
//     if(err) throw err;
//     console.log(res);
// });

// Course.find({}).populate("surveys").exec(function(err, course) {
//     console.log(course[0].surveys);
// });

// Course.updateMany({}, {end: new Date(2018, 11, 25, 10, 0)}).exec((err, res) => {
//     console.log(res);
// });

// Course.findOne({}).exec((err, res) => {
//     console.log(res.end.toLocaleString("vi-VN"));
// });
