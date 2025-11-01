"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          id: 1,
          name: "res1",
          username: "res1",
          password:
            "$2b$10$D.OM6qvQlGa9pqJJ3dgN7OIh4z6tAc8Ay1xq7bhGekyHdfcX.kUsW",
          email: "res1@gmail.com",
          role: "restaurant",
          createdAt: new Date("2025-10-28 15:18:46"),
          updatedAt: new Date("2025-10-28 15:30:40"),
          address: "res1, 1",
          phoneNumber: "0123456789",
        },
        {
          id: 2,
          name: "res2",
          username: "res2",
          password:
            "$2b$10$n8SGhsI0CHYwYnswOEUaWed1sG7LjY0O1xscRjnflnsNBWeXKkYGG",
          email: "res2@gmail.com",
          role: "restaurant",
          createdAt: new Date("2025-10-28 15:19:12"),
          updatedAt: new Date("2025-10-28 15:57:53"),
          address: "asd ,asd",
          phoneNumber: "0123123123",
        },
        {
          id: 3,
          name: "res3",
          username: "res3",
          password:
            "$2b$10$JOFL0hSbIWSLWQnkDOZ.Q.RPntFqLM8QLDxk8vWw9CjtLaHJZo6BC",
          email: "res3@gmail.com",
          role: "restaurant",
          createdAt: new Date("2025-10-28 15:19:40"),
          updatedAt: new Date("2025-10-28 17:08:16"),
          address: "asd asd",
          phoneNumber: "0333333333",
        },
        {
          id: 4,
          name: "res4",
          username: "res4",
          password:
            "$2b$10$QBEGaKhXtd3xru2N9CRq1u8r5Plfgk0LyW7rpRvqgpP2Bf2pJf2pe",
          email: "res4@gmail.com",
          role: "restaurant",
          createdAt: new Date("2025-10-28 15:19:59"),
          updatedAt: new Date("2025-10-28 19:43:57"),
          address: "asd asd",
          phoneNumber: "0444444444",
        },
        {
          id: 5,
          name: "res5",
          username: "res5",
          password:
            "$2b$10$iJcoFHb.vDxfrXwythXUNe927jUx8Md0UdkL3.bhbDIrI5Adejlze",
          email: "res5@gmail.com",
          role: "restaurant",
          createdAt: new Date("2025-10-28 15:20:17"),
          updatedAt: new Date("2025-10-28 20:06:15"),
          address: "asd asd",
          phoneNumber: "0555555555",
        },
        {
          id: 6,
          name: "admin1",
          username: "admin1",
          password:
            "$2b$10$EOiP2/RwoNWI.eH4qmszH.t8zaA6CdahPXWwrZxCO5uLTOjAqR46.",
          email: "admin1@gmail.com",
          role: "admin",
          createdAt: new Date("2025-10-28 15:28:58"),
          updatedAt: new Date("2025-10-28 15:28:58"),
          address: null,
          phoneNumber: null,
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "Restaurants",
      [
        {
          id: 1,
          name: "Bún Cá Xứ Nẫu",
          address:
            "200 Đ. Tôn Đản, Phường 8, Quận 4, Thành phố Hồ Chí Minh 700000, Vietnam",
          promotion: "",
          landingPad: null,
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761640378/restaurants/c6rmmfxmyzj494mzcbma.jpg",
          description: "Xứ Nẫu Bún chả cá Nha Trang",
          userId: 1,
          createdAt: new Date("2025-10-28 15:28:21"),
          updatedAt: new Date("2025-10-28 15:33:10"),
          status: "active",
        },
        {
          id: 2,
          name: "Lẩu gà lá é Nguyễn Quán",
          address:
            "36 Đ. Tám Danh, Phường 4, Quận 8, Thành phố Hồ Chí Minh 70000, Vietnam",
          promotion: "",
          landingPad: null,
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761641961/restaurants/doyyata4wpo5xpxi175s.png",
          description: "Lẩu gà nhà nhà đều ăn",
          userId: 2,
          createdAt: new Date("2025-10-28 15:57:29"),
          updatedAt: new Date("2025-10-28 15:59:25"),
          status: "active",
        },
        {
          id: 3,
          name: "Quán Chín - Cơm Gà Xối Mỡ",
          address:
            "200/25C Xóm Chiếu, Phường 15, Quận 4, Thành phố Hồ Chí Minh, Vietnam",
          promotion: "",
          landingPad: null,
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761646392/restaurants/dacz3n0ifbkoyjkrngnz.png",
          description: "quán bán cơm gà",
          userId: 3,
          createdAt: new Date("2025-10-28 17:08:06"),
          updatedAt: new Date("2025-10-28 17:13:12"),
          status: "active",
        },
        {
          id: 4,
          name: "THÈM NƯỚNG YAKINIKU",
          address:
            "122 Đ. Vĩnh Khánh, Phường 8, Quận 4, Thành phố Hồ Chí Minh 70000, Vietnam",
          promotion: "",
          landingPad: null,
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761655481/restaurants/nynqyw1ow2sgijwhpfah.jpg",
          description: "Đi nướng nào cả nhà ơi",
          userId: 4,
          createdAt: new Date("2025-10-28 19:43:48"),
          updatedAt: new Date("2025-10-28 19:44:42"),
          status: "active",
        },
        {
          id: 5,
          name: "Fruit Station",
          address:
            "12 Bis Đinh Tiên Hoàng, Đa Kao, Quận 1, Thành phố Hồ Chí Minh, Vietnam",
          promotion: "",
          landingPad: null,
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761656857/restaurants/jztdtceykeqtq5s8i2zm.png",
          description: "Tươi - Ngon - Tốt cho sức khỏe",
          userId: 5,
          createdAt: new Date("2025-10-28 20:04:27"),
          updatedAt: new Date("2025-10-28 20:07:38"),
          status: "active",
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "Menu",
      [
        {
          id: 1,
          price: 38000,
          description: "chả tôm được làm từ tôm tươi đầu ngày",
          category: "Bún",
          createdAt: new Date("2025-10-28 15:43:59"),
          updatedAt: new Date("2025-10-28 15:43:59"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761640973/menus/gn1ar3b5qje8bolptuee.png",
          restaurantId: 1,
          name: "Bún chả tôm",
          status: "active",
        },
        {
          id: 2,
          price: 53000,
          description: "có chả tôm, mực, chả cá, sứa.",
          category: "Bún",
          createdAt: new Date("2025-10-28 15:45:14"),
          updatedAt: new Date("2025-10-28 15:45:14"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761641058/menus/x9cihnfqtwe68vrjg1uh.png",
          restaurantId: 1,
          name: "Bún cá đặc biệt",
          status: "active",
        },
        {
          id: 3,
          price: 38000,
          description: "Bánh Canh có chả cá",
          category: "Bánh Canh",
          createdAt: new Date("2025-10-28 15:46:07"),
          updatedAt: new Date("2025-10-28 15:46:07"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761641135/menus/zij0nehmf45cvqltjg0j.png",
          restaurantId: 1,
          name: "Bánh Canh chả cá",
          status: "active",
        },
        {
          id: 4,
          price: 38000,
          description: "Mực tươi mỗi ngày",
          category: "Bún",
          createdAt: new Date("2025-10-28 15:47:08"),
          updatedAt: new Date("2025-10-28 15:47:08"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761641203/menus/gu4tzlj3rdjshqzrbiqk.png",
          restaurantId: 1,
          name: "Bún mực",
          status: "active",
        },
        {
          id: 5,
          price: 50000,
          description: "nem cuốn full topping",
          category: "Nem cuốn",
          createdAt: new Date("2025-10-28 15:48:32"),
          updatedAt: new Date("2025-10-28 15:48:32"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761641238/menus/n8qe1kwazxuki4dk6lql.png",
          restaurantId: 1,
          name: "Nem cuốn Nha Trang",
          status: "active",
        },
        {
          id: 6,
          price: 139000,
          description: "lẩu gà lá é cùng rau, nấm",
          category: "Lẩu",
          createdAt: new Date("2025-10-28 16:05:26"),
          updatedAt: new Date("2025-10-28 16:05:26"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761642263/menus/ymiyyoe98esmv4qfees3.jpg",
          restaurantId: 2,
          name: "Lẩu gà lá é",
          status: "active",
        },
        {
          id: 7,
          price: 139000,
          description:
            "Gà được tẩm ướp kĩ càng và nướng cùng tiêu xanh, ăn kèm muối tiêu chanh",
          category: "Nướng",
          createdAt: new Date("2025-10-28 16:07:33"),
          updatedAt: new Date("2025-10-28 16:07:33"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761642341/menus/uqs2uuphqgrvtfvytgth.jpg",
          restaurantId: 2,
          name: "Gà nướng tiêu xanh",
          status: "active",
        },
        {
          id: 8,
          price: 80000,
          description: "Dê hấp cùng lá tía tô dậy mùi thơm.",
          category: "Hấp",
          createdAt: new Date("2025-10-28 16:08:30"),
          updatedAt: new Date("2025-10-28 16:08:30"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761642468/menus/ham14hqhq95ut46v5jup.jpg",
          restaurantId: 2,
          name: "Dê hấp tía tô",
          status: "active",
        },
        {
          id: 9,
          price: 139000,
          description:
            "xí quách được hầm trong nhiều giờ để đạt được vị ngon nhất.",
          category: "Lẩu",
          createdAt: new Date("2025-10-28 16:09:27"),
          updatedAt: new Date("2025-10-28 16:09:27"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761642525/menus/qqpns4m8ic1ogskdtodt.jpg",
          restaurantId: 2,
          name: "Lẩu xí quách",
          status: "active",
        },
        {
          id: 10,
          price: 60000,
          description:
            "ốc bưu được rửa sạch và nhồi vào phần nhân thịt ốc và thịt heo, cùng nấm và được nêm gia vị cẩn thận",
          category: "Hấp",
          createdAt: new Date("2025-10-28 16:12:21"),
          updatedAt: new Date("2025-10-28 16:12:21"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761642650/menus/vdnhkid5iokny943mtdm.png",
          restaurantId: 2,
          name: "Ốc bưu nhồi thịt hấp",
          status: "active",
        },
        {
          id: 11,
          price: 45000,
          description:
            "cơm được chiên vàng đều, góc tư lớn chiên giòn ngoài trong mềm ăn cùng đồ chua.",
          category: "Cơm",
          createdAt: new Date("2025-10-28 17:15:52"),
          updatedAt: new Date("2025-10-28 17:15:52"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761646479/menus/douthx0jgs3sy8oxmqr9.png",
          restaurantId: 3,
          name: "Cơm gà góc tư",
          status: "active",
        },
        {
          id: 12,
          price: 35000,
          description:
            "cơm chiên cùng các loại nguyên liệu như đậu que, ngô, cà rốt, lạp xưởng.",
          category: "Cơm Chiên",
          createdAt: new Date("2025-10-28 19:38:00"),
          updatedAt: new Date("2025-10-28 19:38:00"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761655040/menus/yyfuyiz26txoy2hdxgtd.jpg",
          restaurantId: 3,
          name: "Cơm chiên dương châu",
          status: "active",
        },
        {
          id: 13,
          price: 45000,
          description: "Cơm chiên ăn cùng bò xào và cải chua nhà làm.",
          category: "Cơm chiên",
          createdAt: new Date("2025-10-28 19:39:00"),
          updatedAt: new Date("2025-10-28 19:39:00"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761655093/menus/xmoynnouwenofc2jeyac.jpg",
          restaurantId: 3,
          name: "Cơm chiên bò xào",
          status: "active",
        },
        {
          id: 14,
          price: 40000,
          description:
            "cơm chiên ăn cùng thịt xá xíu đậm đà được nấu tỉ mỉ trong nhiều giờ.",
          category: "Cơm chiên",
          createdAt: new Date("2025-10-28 19:40:23"),
          updatedAt: new Date("2025-10-28 19:40:23"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761655189/menus/byb0xyr9gbgbaixgdvrh.png",
          restaurantId: 3,
          name: "Cơm chiên xá xíu",
          status: "active",
        },
        {
          id: 15,
          price: 35000,
          description: "Cơm chiên ăn cùng gà ta xé chấm với muối tiêu xanh.",
          category: "Cơm chiên",
          createdAt: new Date("2025-10-28 19:41:13"),
          updatedAt: new Date("2025-10-28 19:41:13"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761655234/menus/dmx2nc3ybywsptllaszy.webp",
          restaurantId: 3,
          name: "Cơm chiên gà xé",
          status: "active",
        },
        {
          id: 16,
          price: 179000,
          description: "Thịt bò được nhập từ Nhật Bản, giấy tờ rõ ràng.",
          category: "Nướng",
          createdAt: new Date("2025-10-28 19:46:56"),
          updatedAt: new Date("2025-10-28 19:46:56"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761655537/menus/tclhyy6bhcjtsnndbgai.png",
          restaurantId: 4,
          name: "Bò AUKOBE",
          status: "active",
        },
        {
          id: 17,
          price: 339000,
          description:
            "Combo gồm: tôm nướng muối ớt, 4 hàu nướng trứng cút, răng mực sốt bơ cay, cơm chiên tặng kèm.",
          category: "Nướng",
          createdAt: new Date("2025-10-28 19:49:17"),
          updatedAt: new Date("2025-10-28 19:49:17"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761655670/menus/hiomwvwmjpeuaegoklxz.png",
          restaurantId: 4,
          name: "Combo Biển Sâu Gợn Sóng",
          status: "active",
        },
        {
          id: 18,
          price: 239000,
          description:
            "Combo gồm: Ba rọi bò, vú heo, nấm, rau ăn kèm, tôm nướng muối ớt.",
          category: "Nướng",
          createdAt: new Date("2025-10-28 19:51:25"),
          updatedAt: new Date("2025-10-28 19:51:25"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761655832/menus/bpxeo9vinkglirhvogtj.png",
          restaurantId: 4,
          name: "Combo Thèm Nướng",
          status: "active",
        },
        {
          id: 19,
          price: 89000,
          description: "Sụn gà được chế biến theo phong cách Nhật Bản.",
          category: "Chiên",
          createdAt: new Date("2025-10-28 19:52:50"),
          updatedAt: new Date("2025-10-28 19:52:50"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761655929/menus/owyjs5ccynvlv0zxb2ga.png",
          restaurantId: 4,
          name: "Sụn gà kiểu nhật",
          status: "active",
        },
        {
          id: 20,
          price: 30000,
          description:
            "1 set hàu nướng gồm 3 con và có thể chọn giữa các loại sốt bơ, mỡ hành, sa tế.",
          category: "Nướng",
          createdAt: new Date("2025-10-28 19:55:39"),
          updatedAt: new Date("2025-10-28 19:55:39"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761656058/menus/gukoeyhoarwkwsyngsiy.png",
          restaurantId: 4,
          name: "Hàu nướng",
          status: "active",
        },
        {
          id: 21,
          price: 25000,
          description:
            "tất cả các loại hoa quả đều có xuất xứ rõ ràng, chất lượng.",
          category: "Sinh tố",
          createdAt: new Date("2025-10-28 20:09:14"),
          updatedAt: new Date("2025-10-28 20:09:14"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761656910/menus/wm295ohhebqbcgwhchkk.png",
          restaurantId: 5,
          name: "Sinh tố bơ dâu",
          status: "active",
        },
        {
          id: 22,
          price: 25000,
          description:
            "tất cả các loại trái cây đều tươi mới và có xuất xứ rõ ràng.",
          category: "Sinh tố",
          createdAt: new Date("2025-10-28 20:12:03"),
          updatedAt: new Date("2025-10-28 20:12:03"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761657085/menus/yass6nqdu5muz1uz4tzi.png",
          restaurantId: 5,
          name: "Sinh tố thơm",
          status: "active",
        },
        {
          id: 23,
          price: 35000,
          description:
            "tất cả các loại trái cây đều tươi mới và có xuất xứ rõ ràng.",
          category: "Trái cây dằm",
          createdAt: new Date("2025-10-28 20:13:46"),
          updatedAt: new Date("2025-10-28 20:13:46"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761657157/menus/v0ibtvhnskmup2976hzl.png",
          restaurantId: 5,
          name: "Trái cây dằm yaourt",
          status: "active",
        },
        {
          id: 24,
          price: 30000,
          description:
            "tất cả các loại trái cây đều tươi mới và có xuất xứ rõ ràng.",
          category: "Sinh tố",
          createdAt: new Date("2025-10-28 20:15:02"),
          updatedAt: new Date("2025-10-28 20:15:02"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761657282/menus/gp37pwbsyd31trid0xuq.png",
          restaurantId: 5,
          name: "Sinh tố cà rốt - thơm",
          status: "active",
        },
        {
          id: 25,
          price: 25000,
          description:
            "tất cả các loại trái cây đều tươi mới và có xuất xứ rõ ràng.",
          category: "Sinh tố",
          createdAt: new Date("2025-10-28 20:17:05"),
          updatedAt: new Date("2025-10-28 20:17:05"),
          imageUrl:
            "https://res.cloudinary.com/dqz1fnpo4/image/upload/v1761657422/menus/oue6zgmbxwwwbmwbi2u1.png",
          restaurantId: 5,
          name: "Sinh tố xoài",
          status: "active",
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Menu", { id: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25] }, {});
    await queryInterface.bulkDelete("Restaurants", { id: [1, 2, 3, 4, 5] }, {});
    await queryInterface.bulkDelete("Users", { id: [1, 2, 3, 4, 5, 6] }, {});
  },
};
