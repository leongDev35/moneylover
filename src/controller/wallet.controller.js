import { UserRepository, WalletRepository } from '../Repository/Repository.js';


//! CRUD
export async function createWallet(req, res) {
    try {
        console.log(req.body.userId);
        console.log(req.body.total);
        console.log(req.body.walletName);
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
        console.log(walletNameCheck);
        if (walletNameCheck.length != 0) {
            return res.json({ message: 'Tên ví đã tồn tại' });
        } else {
            let wallet = {
                wallet_name: req.body.walletName,
                total: req.body.total,
                user: req.body.userId,
            }
            await WalletRepository.save(wallet);
            const result = await WalletRepository
            .createQueryBuilder('wallet')
            .select('SUM(wallet.total)', 'total')
            .getRawOne();
            console.log(result);
            return res.json({ success: 'Tạo thành công ví' });

        }
    } catch (error) {
        console.log(error);
        return res.json({ message: 'Có lỗi xảy ra, vui lòng thử lại!' });
    }
}

export async function getWWallet(req, res) {
    try {
        const wallets = await WalletRepository.find({
            where: {
                user: {
                    user_id: req.body.userId,
                },
            },
        });
        console.log(wallets);
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
        console.log(wallet);
    } catch (error) {
        console.log(error);
        return res.json({ message: 'Có lỗi xảy ra, vui lòng thử lại!' });
    }
}