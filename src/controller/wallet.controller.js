import { UserRepository, WalletRepository } from '../Repository/Repository.js';


//! CRUD
export async function createWallet(req, res) {
    try {
       
        //! Check wallet Name trong user 
        const walletNameCheck = await WalletRepository.find({
            where: {
                // user: req.body.userId,
                wallet_name: req.body.walletName,
                user: {
                    user_id: req.body.userId,
                },
            },
        });
        if (walletNameCheck.length != 0) {
            return res.json({ message: 'Tên ví đã tồn tại' });
        } else {
            let wallet = {
                wallet_name: req.body.walletName,
                total: req.body.total,
                user: req.body.userId,
            }
            await WalletRepository.save(wallet);

            //! lưu total của ví mới vào balance của user

            const user = await await UserRepository.find({
                where: {
                    user_id: req.body.userId,
                },
            });
            user[0].balance = user[0].balance + parseInt(req.body.total);

            UserRepository
                .save(user[0])
                .then((savedUser) => {
                    console.log('User saved with new balance:', savedUser);
                })
                .catch((error) => {
                    console.error('Error saving user with new balance:', error);
                });

           
            return res.json({ success: 'Tạo thành công ví' });

        }
    } catch (error) {
        console.log(error);
        return res.json({ message: 'Có lỗi xảy ra, vui lòng thử lại!' });
    }
}
export async function checkWalletName(req, res) {
    try {
        
        //! Check wallet Name trong user 
        const walletNameCheck = await WalletRepository.find({
            where: {
                // user: req.body.userId,
                wallet_name: req.body.walletName,
                user: {
                    user_id: req.body.userId,
                },
            },
        });
        if (walletNameCheck.length != 0) {
            return res.json({ message: 'Tên ví đã tồn tại' });
        } else {
          
            return res.json({ message: 'Tên ví chưa tồn tại' });

        }
    } catch (error) {
        console.log(error);
        return res.json({ message: 'Có lỗi xảy ra, vui lòng thử lại!' });
    }
}

export async function getWallet(req, res) {
    try {
        const wallets = await WalletRepository.find({
            select: ["wallet_id", "wallet_name", "wallet_icon" ,"total"],
            where: {
                user: {
                    user_id: req.query.userId,
                },
            },
        });
        return res.json({
            wallets
        });
    } catch (error) {
        console.log(error);
        return res.json({ message: 'Có lỗi xảy ra, vui lòng thử lại!' });
    }
}

export async function getWWalletDetail(req, res) {
    try {
        const wallet = await WalletRepository.find({
          
            where: {
                wallet_id: req.params.walletId,
                user: {
                    user_id: req.body.userId,
                },
            },
        });
    } catch (error) {
        console.log(error);
        return res.json({ message: 'Có lỗi xảy ra, vui lòng thử lại!' });
    }
}

export async function changeTotalWallet(req, res) {
    try {
       
        const walletCheck = await WalletRepository.find({
            where: {
                wallet_id: req.params.walletId
            },
        });
        const user = await await UserRepository.find({
            where: {
                user_id: req.body.userId,
            },
        });
        

        const oldTotal = walletCheck[0].total;
        walletCheck[0].total = parseInt(req.body.newTotal);

        WalletRepository
                .save(walletCheck[0])
                .then((savedWallet) => {
                    console.log('wallet saved with new total:', savedWallet);
                })
                .catch((error) => {
                    console.error('Error saving wallet with new total:', error);
                });
         //! lưu tổng mới cho user     
         user[0].balance = user[0].balance + parseInt(req.body.newTotal) - oldTotal;

         UserRepository
             .save(user[0])
             .then((savedUser) => {
                 console.log('User saved with new total:', savedUser);
             })
             .catch((error) => {
                 console.error('Error saving user with new total:', error);
             });
        return res.json({ message: 'Thay đổi thành công Balance với số dư mới của ví' });

    } catch (error) {
        console.log(error);
        return res.json({ message: 'Có lỗi xảy ra, vui lòng thử lại!' });
    }
}