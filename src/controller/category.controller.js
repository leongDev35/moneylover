import { CategoryChildRepository, CategoryRepository } from "../Repository/Repository.js";

//! CRUD
export async function createCategory(req, res) {
    try {
        console.log(req.body.categoryType);
        console.log(req.body.categoryParentId);
        console.log(req.body.categoryName);
        console.log(req.body.userId);

        const categoryParentId = req.body.categoryParentId;
        
        //! Nếu có categoryParent
        if(categoryParentId == null || categoryParentId == "")  {
            console.log("không có categoryParent");
            //! Lưu vào Category Parent. Kiểm tra xem có tên như vậy ở trong CP không
            const categoryNameCheck = await CategoryRepository.find({
                where: {
                    // user: req.body.userId,
                    category_name: req.body.categoryName,
                    user: {
                        user_id: req.body.userId,
                    },
                },
            });
            console.log(categoryNameCheck,11);
            if (categoryNameCheck.length != 0) {
                return res.json({ message: 'Tên category đã tồn tại' });
            } else {
                let categoryParent = {
                    category_name: req.body.categoryName,
                    category_type: req.body.categoryType,
                    user: req.body.userId,
                }
                await CategoryRepository.save(categoryParent);
                
                return res.json({ success: 'Tạo thành công categoryParent' });
    
            }
        } else {
            //! lưu vào trong category con với rela đến categoryParent có id tương ứng, check trong category parent có name như vậy không
            const categoryChildCheck = await CategoryChildRepository.find({
                where: {
                    // user: req.body.userId,
                    category_child_name: req.body.categoryName,
                    user: {
                        user_id: req.body.userId,
                    },
                    category: {
                        category_id: req.body.categoryParentId,
                    },
                },
            });
            console.log(categoryChildCheck,22);

            if (categoryChildCheck.length != 0) {
                return res.json({ message: 'Tên category đã tồn tại' });
            } else {
                let categoryChild = {
                    category_child_name: req.body.categoryName,
                    category_type: req.body.categoryType,
                    user: req.body.userId,
                    category: req.body.categoryParentId
                }
                await CategoryChildRepository.save(categoryChild);
                return res.json({ success: 'Tạo thành công categoryChild' });
    
            }
        }

    } catch (error) {
        console.log(error);
        return res.json({ message: 'Có lỗi xảy ra, vui lòng thử lại!' });
    }
}