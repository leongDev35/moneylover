import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sentEmail } from './email.controller.js';
import { UserRepository, WalletRepository } from '../Repository/Repository.js';

// const UserRepository = myDataSource.getRepository(UserEntity)

//! CRUD
export async function findUser(req, res) {
    const users = await UserRepository.find()
    res.json(users)
}
export async function createUser(req, res) {
    try {
        //! check username 
        const userCheck = await UserRepository.find({
            where: {
                username: req.body.username,
            },
        });
        const emailCheck = await UserRepository.find({
            where: {
                email: req.body.email,
            },
        });
        if (userCheck.length != 0) {
            return res.json({
                message: `User ${req.body.username} exists already`
            });
        } else if (emailCheck.length != 0) {
            return res.json({
                message: `Email ${req.body.email} exists already`
            });
        } else {
            const generateRandomToken = () => {
                return crypto.randomBytes(20).toString('hex');
            };
            const token = generateRandomToken();
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const user = {
                username: req.body.username,
                fullName: req.body.fullName,
                password: hashedPassword,
                email: req.body.email,
                balance: 0,
                tokenAuthEmail: token
            };

            let userSaved = await UserRepository.save(user)
            if (userSaved) {
                console.log(userSaved);
                const content = `Hello http://localhost:3050/users/confirmEmail/${token}`;
                //! gửi email xác thực người dùng
                sentEmail(
                    req.body.email,
                    'Xác nhận tài khoản',
                    content
                )
                    .then(() => {
                        console.log('sent successful');
                    })
                    .catch((err) => console.log(err));

                //! tạo ví mặc định
                let walletDefault = {
                    wallet_name: 'Tiền mặt',
                    wallet_icon: 'https://static.moneylover.me/img/icon/ic_category_all.png',
                    total: 0,
                    user: userSaved.user_id //! sử dụng id user để mapping
                }
                await WalletRepository.save(walletDefault);

                return res.json({ success: 'Tạo thành công người dùng' });
            } else {
                return res.json({ message: 'Có lỗi xảy ra, vui lòng thử lại!' });
            }
        }

    } catch (err) {
        console.log(err);
        return res.json({ message: 'Có lỗi xảy ra, vui lòng thử lại!' });
    }
}
export async function updateUser(req, res) {
    try {
        const user = await await UserRepository.find({
            where: {
                user_id: req.params.userId,
            },
        });
        console.log(user);
        user[0].fullName = req.body.fullName !== undefined && req.body.fullName !== null ? req.body.fullName : user[0].fullName;
        UserRepository
            .save(user[0])
            .then((savedUser) => {
                console.log('User saved:', savedUser);
            })
            .catch((error) => {
                console.error('Error saving user:', error);
            });
        return res.json({ message: 'Update thành công' });
    } catch (err) {
        return res.json({ message: 'Bạn cần đăng nhập trước đã' });
    }
}

//! email

export async function confirmEmail(req, res) {
    try {

        const user = await await UserRepository.find({
            where: {
                tokenAuthEmail: req.params.token,
            },
        });
        user[0].authEmail = true;
        UserRepository
            .save(user[0])
            .then((savedUser) => {
                console.log('User saved:', savedUser);
            })
            .catch((error) => {
                console.error('Error saving user:', error);
            });
        const htmlResponse = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Xác nhận tài khoản</title>
            </head>
            <body>
              <h1>Xác nhận tài khoản</h1>
              <p>Bạn đã xác nhận email ${user.email} liên kết với tài khoản ${user.userName} thành công. Cảm ơn bạn và chúc bạn một ngày tốt lành!</p>
            </body>
          </html>
     `;
        return res.send(htmlResponse);
    } catch (error) {
        console.log(error);
        return res.json({ message: 'Có lỗi xảy ra' });
    }
}

//! login logout
export async function login(req, res) {
    try {
        const userCheck = await UserRepository.find({
            where: {
                username: req.body.username,
            },
        });
        if (userCheck.length == 0) {
            return res.json({
                message: `User ${req.body.username} is not exist`
            });
        } else {
            const hashedPassword = await bcrypt.compare(
                req.body.password,
                userCheck[0].password
            );
            if (hashedPassword) {
                const payload = { username: req.body.username };
                const accessToken = jwt.sign(payload, process.env.JWT_SECRET);
                const userData = {
                    user_id: userCheck[0].user_id,
                    username: userCheck[0].username,
                    fullName: userCheck[0].fullName,
                    email: userCheck[0].email,
                    authEmail: userCheck[0].authEmail,
                };

                return res.json({
                    accessToken,
                    userData,
                    success: 'Login successful'
                });
            } else {
                return res.json({
                    message: 'Password is wrong'
                });
            }
        }
    } catch (err) {
        console.log(err);
        return res.json({ message: 'Something error' });
    }
}

export function logout(req, res) {
    console.log("logout");
}

//! password

export async function updatePassword(req, res) {
    const userId = req.params.userId
    console.log(userId);
    console.log(req.body.password);

    try {
        const user = await await UserRepository.find({
            where: {
                user_id: req.params.userId,
            },
        });

        const comparePassword = await bcrypt.compare(
            req.body.password,
            user[0].password
        );
        if (comparePassword) {
            if (req.body.newPassword !== req.body.checkNewPassword) {
                return res.json({ message: 'Mật khẩu mới không trùng nhau' });

            } else {
                const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
                user[0].password = hashedPassword;
                UserRepository
                    .save(user[0])
                    .then((savedUser) => {
                        console.log('Password updated:', savedUser);
                    })
                    .catch((error) => {
                        console.error('Error saving user:', error);
                    });
                return res.json({ message: 'Mật khẩu đã được cập nhật' });
            }
        } else {
            return res.json({ message: 'Mật khẩu cũ không đúng' });
        }

    } catch (error) {
        return res.json({ message: 'Bạn cần đăng nhập trước đã' });
    }
}

export async function sentNewPassword(req, res) {
    try {
        const user = await await UserRepository.find({
            where: {
                email: req.body.email,
            },
        });
        if (user.length == 0) {
            return res.json({ message: 'Email không tồn tại trong hệ thống' });
        } else {
            const generateRandomToken = () => {
                return crypto.randomBytes(10).toString('hex');
            };
            const token = generateRandomToken();
            const hashedPassword = await bcrypt.hash(token, 10);
            user[0].password = hashedPassword;
            UserRepository
                .save(user[0])
                .then((savedUser) => {
                    console.log('Password change', savedUser);
                })
                .catch((error) => {
                    console.error('Error saving user:', error);
                });
            const content = `Password mới của tài khoản ${user[0].username} là: ${token}
          Vui lòng đổi mật khẩu tại đây....`;
            //! gửi email xác thực người dùng
            sentEmail(req.body.email, 'Xác nhận tài khoản', content)
                .then(() => {
                    console.log('sent successful');
                })
                .catch((err) => console.log(err));
            return res.json({ success: 'Đã gửi email reset mật khẩu thành công' });
        }
    } catch (error) {
        console.log(error);
        return res.json({ message: 'Có lỗi xảy ra' });
    }
}


//! lọc giao dịch

//! theo category
//! theo ngày tháng or quý cụ thể
