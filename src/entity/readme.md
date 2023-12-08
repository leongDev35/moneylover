Entity là một lớp mapping với một bảng (or 1 collection khi sử dụng MongoDb)
Một Entity PHẢI có một khóa chính với mysql (or ObjectId vs MongoDb)
Sử dụng Schema để định nghĩa một entity và các cột của nó thành một file riêng
One to one: Mỗi dòng trong bảng A chỉ tương ứng với một dòng ở bảng B và ngược lại
    ví dụ: User và Profile
One to Many(một chiều): Mỗi dòng trong bảng A có thể tương ứng với nhiều dòng trong bảng B, nhưng ngược lại không đúng
    Ví dụ: Department và Employee. Mỗi phòng có thể có nhiều nhân viên, nhưng mỗi nhân viên chỉ thuộc về một phòng
Many to Many: Mỗi dòng bảng A tương ứng với nhiều dòng bảng B và ngược lại.
    Ví dụ: Student và Course