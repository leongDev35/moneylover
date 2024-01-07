import { TransactionRepository } from "../Repository/Repository.js";
import { myDataSource } from "../data-source.js";
import { CategoryChildEntity } from "../entity/Category-child.js";
import { CategoryEntity } from "../entity/Category.js";
import { Between } from 'typeorm';
export async function fillDay(req, res) {
    try {
        const result = await TransactionRepository
            .createQueryBuilder()
            .select([
                'category_child.category_child_name',
                'category.category_name',
                'category.category_type',
                'transaction.categoryCategoryId',
                'transaction.transaction_id',
                'transaction.transaction_date',
                'transaction.amount',
                'SUM(transaction.amount) AS totalAmount'
            ])
            .innerJoin(CategoryEntity, 'category', 'transaction.categoryCategoryId = category.category_id')
            .leftJoin(CategoryChildEntity, 'category_child', 'transaction.categoryChildCategoryChildId = category_child.category_child_id')
            .where('MONTH(transaction.transaction_date) = MONTH(:selectedDate)', { selectedDate: '2023-12-01' })
            .andWhere('YEAR(transaction.transaction_date) = YEAR(:selectedDate)', { selectedDate: '2023-12-01' })
            .groupBy('transaction.transaction_date, transaction.transaction_id WITH ROLLUP')
            .getRawMany();

        // console.log(result);
        return res.json(result);

    } catch (error) {
        console.log(error);
    }
}

export async function get20RecentMonth(req, res) {
    try {

        const today = new Date();
        const month20 = [];
        function formatMonth(month) {
            return month < 9 ? `0${month + 1}` : `${month + 1}`;
        }

        for (let i = 0; i < 20; i++) {
            const pastMonth = new Date(today);
            pastMonth.setMonth(today.getMonth() - i);
            let month = pastMonth.getMonth();
            let year = pastMonth.getFullYear();
            // Định dạng ngày tháng theo ý muốn, ví dụ: "Tháng Năm"
            const formattedMonth = new Intl.DateTimeFormat('vi-VN', { year: 'numeric', month: 'long' }).format(pastMonth);
            const idMonthYear = `${formatMonth(month)}-${year}`

            let obj = {
                idMonthYear: idMonthYear,
                formattedMonth: formattedMonth
            }
            month20.push(obj);
        }



        //! ví tổng 
        const result = await TransactionRepository
            .createQueryBuilder('transaction')
            .innerJoinAndSelect('transaction.category', 'category')
            .where("transaction.userUserId = :user_id", { user_id: req.params.userId })
            .select([
                'DATE_FORMAT(transaction.transaction_date, "%m-%Y") AS thang',
                'SUM(transaction.amount) AS giaoDichTrongThang',
                'SUM(SUM(transaction.amount)) OVER (ORDER BY DATE_FORMAT(transaction.transaction_date, "%Y-%m") asc) AS soDuCuoiKy',
                'SUM(SUM(transaction.amount)) OVER (ORDER BY DATE_FORMAT(transaction.transaction_date, "%Y-%m") asc) - SUM(transaction.amount) AS soDuDauKy',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 1 AND 10 THEN transaction.amount ELSE 0 END) AS total_expenses_1_to_10',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 11 AND 20 THEN transaction.amount ELSE 0 END) AS total_expenses_11_to_20',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 21 AND 31 THEN transaction.amount ELSE 0 END) AS total_expenses_21_to_31',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 1 AND 10 AND category.category_type = "expense" THEN transaction.amount ELSE 0 END) AS chiTieuTrong1_10',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 1 AND 10 AND category.category_type = "income" THEN transaction.amount ELSE 0 END) AS ThuTrong1_10',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 11 AND 20 AND category.category_type = "expense" THEN transaction.amount ELSE 0 END) AS chiTieuTrong11_20',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 11 AND 20 AND category.category_type = "income" THEN transaction.amount ELSE 0 END) AS ThuTrong11_20',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 21 AND 31 AND category.category_type = "expense" THEN transaction.amount ELSE 0 END) AS chiTieuTrong21_31',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 21 AND 31 AND category.category_type = "income" THEN transaction.amount ELSE 0 END) AS ThuTrong21_31',
            ])
            .groupBy('DATE_FORMAT(transaction.transaction_date, "%Y-%m")')
            .orderBy('DATE_FORMAT(transaction.transaction_date, "%Y-%m")', 'DESC')
            .limit(20)
            .getRawMany();


        //! vòng for với result
        for (let i = 0; i < result.length; i++) {
            for (let j = 0; j < month20.length; j++) {
                if (result[i].thang == month20[j].idMonthYear) {
                    month20[j] = { ...month20[j], ...result[i] }
                    break;
                }

            }

        }

        //! vòng lặp để set số dư đầu và cuối của những tháng không có 
        if (!month20[0].soDuDauKy) {
            month20[0].soDuDauKy = 0;
            month20[0].soDuCuoiKy = 0;
        }
        for (let i = 1; i < month20.length; i++) {

            if (!month20[i].soDuDauKy) {
                month20[i].soDuDauKy = month20[i - 1].soDuDauKy;
                month20[i].soDuCuoiKy = month20[i - 1].soDuDauKy;
            }


        }
        // console.log(result);


        return res.json(month20);

    } catch (error) {
        console.log(error);
    }
}

export async function getTransactionInMonth(req, res) {
    try {
        function convertToFormattedDate(input) {
            // Tách tháng và năm từ chuỗi đầu vào
            const [month, year] = input.split('-');

            // Tạo đối tượng Date với ngày đầu tiên của tháng
            const date = new Date(`${year}-${month}-05`);

            // Lấy ngày định dạng chuỗi 'YYYY-MM-DD'
            const formattedDate = date.toISOString().split('T')[0];

            return formattedDate;
        }
        const inputString = '12-2023';
        const formattedDate = convertToFormattedDate(inputString);
        const result = await TransactionRepository
            .createQueryBuilder()
            .select([
                'category_child.category_child_name',
                'category.category_name',
                'category.category_type',
                'transaction.categoryCategoryId',
                'transaction.transaction_id',
                'transaction.transaction_date',
                'transaction.amount',
                'SUM(transaction.amount) AS totalAmount',
            ])
            .innerJoin(CategoryEntity, 'category', 'transaction.categoryCategoryId = category.category_id')
            .leftJoin(CategoryChildEntity, 'category_child', 'transaction.categoryChildCategoryChildId = category_child.category_child_id')
            .where('DATE_FORMAT(transaction.transaction_date, "%Y-%m") = DATE_FORMAT(:selectedDate, "%Y-%m")', { selectedDate: convertToFormattedDate(req.params.month) })
            .andWhere("transaction.userUserId = :user_id", { user_id: req.params.userId })
            .orderBy('DATE_FORMAT(transaction.transaction_date, "%Y-%m")', 'DESC')
            .groupBy('transaction.transaction_id')
            .getRawMany();

        return res.json(result);

    } catch (error) {
        console.log(error);
    }
}

export async function getTransactionInRange(req, res) {
    try {

        const [down, up] = req.params.range.split('-');
        const [month, year] = req.params.month.split('-');

        function convertToFormattedDate(input) {
            // Tách tháng và năm từ chuỗi đầu vào
            const [month, year] = input.split('-');

            // Tạo đối tượng Date với ngày đầu tiên của tháng
            const date = new Date(`${year}-${month}-05`);

            // Lấy ngày định dạng chuỗi 'YYYY-MM-DD'
            const formattedDate = date.toISOString().split('T')[0];

            return formattedDate;
        }

        const result = await TransactionRepository
            .createQueryBuilder()
            .select([
                'category_child.category_child_name',
                'category_child.category_child_icon',
                'category.category_name',
                'category.category_type',
                'category.category_icon',
                'transaction.categoryCategoryId',
                'transaction.transaction_id',
                'transaction.transaction_date',
                'transaction.amount',
                'SUM(transaction.amount) AS totalAmount',
            ])
            .innerJoin(CategoryEntity, 'category', 'transaction.categoryCategoryId = category.category_id')
            .leftJoin(CategoryChildEntity, 'category_child', 'transaction.categoryChildCategoryChildId = category_child.category_child_id')
            .where('DATE_FORMAT(transaction.transaction_date, "%Y-%m") = DATE_FORMAT(:selectedDate, "%Y-%m")', { selectedDate: convertToFormattedDate(req.params.month) })
            .andWhere("transaction.userUserId = :user_id", { user_id: req.params.userId })
            .andWhere(`DAY(transaction.transaction_date) BETWEEN ${down} AND ${up}`)
            .orderBy('DATE_FORMAT(transaction.transaction_date, "%Y-%m")', 'DESC')
            .groupBy('transaction.transaction_id')
            .getRawMany();



        let resultFinal = {
            title: `${down}/${month}/${year} - ${up}/${month}/${year}`,
            expense: req.params.expense,
            income: req.params.income,
            arrDays: [

            ],
            amountResult: result.length
        }

        const utcDateString = "2023-12-26T17:00:00.000Z";

        //! hàm so sánh date xem có cùng 1 ngày không
        function areDatesEqual(date1, date2) {
            return (
                date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate()
            );
        }
        //! for thứ 1
        for (let i = 0; i < result.length; i++) {
            let flag = false;
            if (resultFinal.arrDays.length > 0) {
                for (let j = 0; j < resultFinal.arrDays.length; j++) {

                    if (areDatesEqual(result[i].transaction_transaction_date, resultFinal.arrDays[j].date)) {
                        resultFinal.arrDays[j].arrTrans.push(result[i])
                        flag = true;
                        break;
                    }

                }
            }

            if (!flag) {
                resultFinal.arrDays.push({
                    date: result[i].transaction_transaction_date,
                    arrTrans: [
                        { ...result[i] }
                    ]
                })
            }
        }

        for (let i = 0; i < resultFinal.arrDays.length; i++) {

            resultFinal.arrDays[i].date = convertDay(resultFinal.arrDays[i].date)
        }

        return res.json(resultFinal);

    } catch (error) {
        console.log(error);
        return res.json(error);


    }
}
//! hàm chuyển đổi date sang định dạng ngày tháng việt nam
export function convertDay(day) {

    // Chuyển đổi chuỗi thành đối tượng Date
    const utcDate = new Date(day);

    // Đặt múi giờ Việt Nam (GMT+7)
    utcDate.setHours(utcDate.getHours() + 7);
    // Định dạng ngày tháng với thư viện Intl.DateTimeFormat
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Ho_Chi_Minh', // Múi giờ Việt Nam
    };

    const formattedDate = new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long', timeZone: 'Asia/Ho_Chi_Minh'
    }).format(utcDate);
    const date = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(utcDate);
    const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', timeZone: 'Asia/Ho_Chi_Minh' }).format(utcDate);

    const dateObj = {
        date: date < 10 ? `0${date}` : date,
        weekday: weekday,
        formattedDate: formattedDate
    }

    return dateObj;
}

//! hàm lấy lấy thu chi theo khoảng thời gian trong 1 tháng
export async function getNetIncomeInMonth(req, res) {
    try {

        function convertToFormattedDate(input) {
            // Tách tháng và năm từ chuỗi đầu vào
            const [month, year] = input.split('-');
            // Tạo đối tượng Date với ngày đầu tiên của tháng
            const date = new Date(`${year}-${month}-05`);

            // Lấy ngày định dạng chuỗi 'YYYY-MM-DD'
            const formattedDate = date.toISOString().split('T')[0];

            return formattedDate;
        }

        //! ví tổng 
        const result = await TransactionRepository
            .createQueryBuilder('transaction')
            .innerJoinAndSelect('transaction.category', 'category')
            .where('DATE_FORMAT(transaction.transaction_date, "%Y-%m") = DATE_FORMAT(:selectedDate, "%Y-%m")', { selectedDate: convertToFormattedDate(req.params.month) })
            .andWhere("transaction.userUserId = :user_id", { user_id: req.params.userId })
            .select([
                'DATE_FORMAT(transaction.transaction_date, "%m-%Y") AS thang',
                'SUM(transaction.amount) AS giaoDichTrongThang',
                'SUM(SUM(transaction.amount)) OVER (ORDER BY DATE_FORMAT(transaction.transaction_date, "%Y-%m") asc) AS soDuCuoiKy',
                'SUM(SUM(transaction.amount)) OVER (ORDER BY DATE_FORMAT(transaction.transaction_date, "%Y-%m") asc) - SUM(transaction.amount) AS soDuDauKy',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 1 AND 6 AND category.category_type = "expense" THEN transaction.amount ELSE 0 END) AS chiTieuTrong1_6',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 1 AND 6 AND category.category_type = "income" THEN transaction.amount ELSE 0 END) AS ThuTrong1_6',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 7 AND 13 AND category.category_type = "expense" THEN transaction.amount ELSE 0 END) AS chiTieuTrong7_13',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 7 AND 13 AND category.category_type = "income" THEN transaction.amount ELSE 0 END) AS ThuTrong7_13',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 14 AND 20 AND category.category_type = "expense" THEN transaction.amount ELSE 0 END) AS chiTieuTrong14_20',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 14 AND 20 AND category.category_type = "income" THEN transaction.amount ELSE 0 END) AS ThuTrong14_20',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 21 AND 26 AND category.category_type = "expense" THEN transaction.amount ELSE 0 END) AS chiTieuTrong21_26',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 21 AND 26 AND category.category_type = "income" THEN transaction.amount ELSE 0 END) AS ThuTrong21_26',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 27 AND 31 AND category.category_type = "expense" THEN transaction.amount ELSE 0 END) AS chiTieuTrong27_31',
                'SUM(CASE WHEN DAY(transaction.transaction_date) BETWEEN 27 AND 31 AND category.category_type = "income" THEN transaction.amount ELSE 0 END) AS ThuTrong27_31',
            ])
            .groupBy('DATE_FORMAT(transaction.transaction_date, "%Y-%m")')
            .orderBy('DATE_FORMAT(transaction.transaction_date, "%Y-%m")', 'DESC')
            .limit(20)
            .getRawOne();

        console.log(result);

        if (result == undefined) {
            return res.json({ message: 'Không có dữ liệu' })
        } else {
            const object = {
                arrIncome: [result.ThuTrong1_6, result.ThuTrong7_13, result.ThuTrong14_20, result.ThuTrong21_26, result.ThuTrong27_31],
                arrExpense: [result.chiTieuTrong1_6, result.chiTieuTrong7_13, result.chiTieuTrong14_20, result.chiTieuTrong21_26, result.chiTieuTrong27_31]
            }

            return res.json(object);
        }



    } catch (error) {
        console.log(error);
    }
}

//! trả về các khoản thu theo category trong một tháng cụ thể

export async function getCategoryIncomeInMonth(req, res) {
    try {

        function convertToFormattedDate(input) {
            // Tách tháng và năm từ chuỗi đầu vào
            const [month, year] = input.split('-');
            // Tạo đối tượng Date với ngày đầu tiên của tháng
            const date = new Date(`${year}-${month}-05`);

            // Lấy ngày định dạng chuỗi 'YYYY-MM-DD'
            const formattedDate = date.toISOString().split('T')[0];

            return formattedDate;
        }

        //! ví tổng 
        const result = await TransactionRepository
            .createQueryBuilder('transaction')
            .innerJoinAndSelect('transaction.category', 'category')
            .where('DATE_FORMAT(transaction.transaction_date, "%Y-%m") = DATE_FORMAT(:selectedDate, "%Y-%m")', { selectedDate: convertToFormattedDate(req.params.month) })
            .andWhere("transaction.userUserId = :user_id", { user_id: req.params.userId })
            .andWhere("category.category_type = :type", { type: 'income' })
            .select([
                'category.category_name AS CategoryName',
                'category.category_id AS CategoryId',
                'DATE_FORMAT(transaction.transaction_date, "%m-%Y") AS thang',
                'SUM(transaction.amount) AS giaoDichTrongThangTheoCategory',

            ])
            .groupBy('category.category_name')
            .getRawMany();






        const data = {

            arrayCategoryName: [],
            arrayCategoryValue: []
        }

        for (let i = 0; i < result.length; i++) {
            data.arrayCategoryName.push(result[i].CategoryName)
            data.arrayCategoryValue.push({
                value: result[i].giaoDichTrongThangTheoCategory,
                name: result[i].CategoryName
            })
        }
        return res.json(data);


    } catch (error) {
        console.log(error);
    }
}
export async function getCategoryExpenseInMonth(req, res) {
    try {

        function convertToFormattedDate(input) {
            // Tách tháng và năm từ chuỗi đầu vào
            const [month, year] = input.split('-');
            // Tạo đối tượng Date với ngày đầu tiên của tháng
            const date = new Date(`${year}-${month}-05`);

            // Lấy ngày định dạng chuỗi 'YYYY-MM-DD'
            const formattedDate = date.toISOString().split('T')[0];

            return formattedDate;
        }

        //! ví tổng 
        const result = await TransactionRepository
            .createQueryBuilder('transaction')
            .innerJoinAndSelect('transaction.category', 'category')
            .where('DATE_FORMAT(transaction.transaction_date, "%Y-%m") = DATE_FORMAT(:selectedDate, "%Y-%m")', { selectedDate: convertToFormattedDate(req.params.month) })
            .andWhere("transaction.userUserId = :user_id", { user_id: req.params.userId })
            .andWhere("category.category_type = :type", { type: 'expense' })
            .select([
                'category.category_name AS CategoryName',
                'category.category_id AS CategoryId',
                'DATE_FORMAT(transaction.transaction_date, "%m-%Y") AS thang',
                'SUM(transaction.amount) AS giaoDichTrongThangTheoCategory',

            ])
            .groupBy('category.category_name')
            .getRawMany();






        const data = {
            arrayCategoryName: [],
            arrayCategoryValue: []
        }

        for (let i = 0; i < result.length; i++) {
            data.arrayCategoryName.push(result[i].CategoryName)
            data.arrayCategoryValue.push({
                value: result[i].giaoDichTrongThangTheoCategory,
                name: result[i].CategoryName
            })
        }
        return res.json(data);


    } catch (error) {
        console.log(error);
    }
}

//! hàm cho fill Page
export async function getTransactionFillpage(req, res) {
    let [dateStart, dateEnd] = [undefined,undefined]
    if(req.query.timeRange) {
        [dateStart, dateEnd] = req.query.timeRange.split('- ');
    }


    try {
        const test = TransactionRepository
            .createQueryBuilder();
        test.select([
            'category_child.category_child_name',
            'category_child.category_child_icon',
            'category.category_name',
            'transaction.walletWalletId',
            'category.category_type',
            'category.category_icon',
            'transaction.categoryCategoryId',
            'transaction.transaction_id',
            'transaction.transaction_date',
            'transaction.amount',
            'SUM(transaction.amount) AS totalAmount',
        ]).innerJoin(CategoryEntity, 'category', 'transaction.categoryCategoryId = category.category_id')
            .leftJoin(CategoryChildEntity, 'category_child', 'transaction.categoryChildCategoryChildId = category_child.category_child_id')
        //    
        if (req.query.walletId) {
            test.andWhere("transaction.walletWalletId = :wallet_id", { wallet_id: req.query.walletId });
        }

        if (req.query.categoryId) {
            test.andWhere("transaction.categoryCategoryId = :category_id", { category_id: req.query.categoryId });
        }
        if (req.query.categoryChildId) {
            test.andWhere("transaction.categoryChildCategoryChildId = :categoryChild_id", { categoryChild_id: req.query.categoryChildId })

        }
        if (req.query.timeRange) {
            test.andWhere({
                transaction_date: Between(dateStart, dateEnd),
                // Thêm điều kiện cho các trường khác nếu cần
            })

        }
        const result = await test
            .orderBy('DATE_FORMAT(transaction.transaction_date, "%Y-%m")', 'DESC')
            .groupBy('transaction.transaction_id')
            .getRawMany();

        let resultFinal = {
            // title: `${down}/${month}/${year} - ${up}/${month}/${year}`,
            // expense: req.params.expense,
            // income: req.params.income,
            arrDays: [

            ],
            amountResult: result.length
        }
        //! hàm so sánh date xem có cùng 1 ngày không
        function areDatesEqual(date1, date2) {

            return (
                date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate()
            );
        }
        //! for thứ 1
        for (let i = 0; i < result.length; i++) {
            let flag = false;
            if (resultFinal.arrDays.length > 0) {
                for (let j = 0; j < resultFinal.arrDays.length; j++) {
                    if (areDatesEqual(result[i].transaction_transaction_date, resultFinal.arrDays[j].date)) {
                        resultFinal.arrDays[j].arrTrans.push(result[i])
                        flag = true;
                        break;
                    }

                }
            }

            if (!flag) {
                resultFinal.arrDays.push({
                    date: result[i].transaction_transaction_date,
                    arrTrans: [
                        { ...result[i] }
                    ]
                })
            }
        }

        for (let i = 0; i < resultFinal.arrDays.length; i++) {

            resultFinal.arrDays[i].date = convertDay(resultFinal.arrDays[i].date)
        }

        return res.json(resultFinal);

    } catch (error) {
        console.log(error);
        return res.json(error);


    }
}