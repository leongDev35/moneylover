import { CategoryChildRepository, CategoryRepository } from "../Repository/Repository.js";
import { CategoryChildEntity } from "../entity/Category-child.js";

//! CRUD
export async function createCategory(req, res) {
    try {
       

        const categoryParentId = req.body.categoryParentId;

        //! Nếu có categoryParent
        if (categoryParentId == null || categoryParentId == "") {
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

            if (categoryChildCheck.length != 0) {
                return res.json({ message: 'Tên category đã tồn tại' });
            } else {
                let categoryChild = {
                    category_child_name: req.body.categoryName,
                    category_child_type: req.body.categoryType,
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

//! Lấy tất cả category của một User
export async function getCategoryOfUser(req, res) {
    try {

        const allCategory = await CategoryRepository
            .createQueryBuilder()
            .select([
                'category_child.category_child_name',
                'category_child.category_child_id',
                'category_child.category_child_icon',
                'category.category_name',
                'category.category_icon',
                'category.category_type',
                'category.category_id',

            ])
            .leftJoin(CategoryChildEntity, 'category_child', 'category.category_id = category_child.categoryCategoryId')
            .where("category.userUserId = :user_id", { user_id: req.query.userId })
            .andWhere("category.userUserId = :user_id", { user_id: process.env.ID_ADMIN })
            .getRawMany();


        const newArrayCategory = [];


        for (let j = 0; j < allCategory.length; j++) {
            if (newArrayCategory.length == 0) {
                // newArrayCategory.push(allCategory[j])
                if (allCategory[j].category_child_category_child_id != null) {
                    let category = {
                        category_category_id: allCategory[j].category_category_id,
                        category_category_name: allCategory[j].category_category_name,
                        category_category_icon: allCategory[j].category_category_icon,
                        category_category_type: allCategory[j].category_category_type,
                        categoryChild: [
                            {
                                category_child_category_child_id: allCategory[j].category_child_category_child_id,
                                category_child_category_child_icon: allCategory[j].category_child_category_child_icon,
                                category_child_category_child_name: allCategory[j].category_child_category_child_name,

                            }
                        ]
                    }
                    newArrayCategory.push(category)
                }
                else {
                    let category = {
                        category_category_id: allCategory[j].category_category_id,
                        category_category_name: allCategory[j].category_category_name,
                        category_category_icon: allCategory[j].category_category_icon,
                        category_category_type: allCategory[j].category_category_type,
                        categoryChild: null
                    }
                    newArrayCategory.push(category)
                }


            } else {
                let flag = false;
                for (let i = 0; i < newArrayCategory.length; i++) {

                    if (newArrayCategory[i].category_category_id == allCategory[j].category_category_id) {
                        newArrayCategory[i].categoryChild.push({
                            category_child_category_child_id: allCategory[j].category_child_category_child_id,
                            category_child_category_child_icon: allCategory[j].category_child_category_child_icon,
                            category_child_category_child_name: allCategory[j].category_child_category_child_name,
                        })


                        flag = true;
                        break;
                    }
                }
                if (!flag) {

                    if (allCategory[j].category_child_category_child_id != null) {
                        let category = {
                            category_category_id: allCategory[j].category_category_id,
                            category_category_name: allCategory[j].category_category_name,
                            category_category_icon: allCategory[j].category_category_icon,
                            category_category_type: allCategory[j].category_category_type,
                            categoryChild: [
                                {
                                    category_child_category_child_id: allCategory[j].category_child_category_child_id,
                                    category_child_category_child_icon: allCategory[j].category_child_category_child_icon,
                                    category_child_category_child_name: allCategory[j].category_child_category_child_name,

                                }
                            ]
                        }
                        newArrayCategory.push(category)
                    }
                    else {
                        let category = {
                            category_category_id: allCategory[j].category_category_id,
                            category_category_name: allCategory[j].category_category_name,
                            category_category_icon: allCategory[j].category_category_icon,
                            category_category_type: allCategory[j].category_category_type,
                            categoryChild: null
                        }
                        newArrayCategory.push(category)
                    }

                }


            }

        }


        return res.json(newArrayCategory);


    } catch (error) {
        console.log(error);
    }
}