"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSearchNewsdpsk = exports.getSearchNews = exports.incrementNewsView = exports.getLatestAndMostReadNews = exports.getNewsForDashboard = exports.getCategorizedNews = exports.getTitleForDescription = exports.getHomePageNews = exports.deleteAllNews = exports.addManyData = exports.updateNews = exports.deleteNews = exports.getSingleNews = exports.getNews = exports.createNews = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createNews = async (req, res) => {
    console.log(req.body, 'news create');
    try {
        const { title, content, category, subCategory, keywords, subKeywords, imageUrl, imageSource, imageTitle, author, location } = req.body;
        // Validate required fields
        if (!title || !content || !category || !subCategory || !author?.email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Check if author exists
        const existingAuthor = await prisma.user.findUnique({
            where: { email: author.email },
        });
        if (!existingAuthor) {
            return res.status(404).json({ error: 'Author not found' });
        }
        // Create news with all the fields including optional location
        const news = await prisma.news.create({
            data: {
                title,
                content,
                category,
                subCategory,
                keywords,
                subKeywords,
                imageSource: imageSource || 'Unknown',
                imageTitle: imageTitle || 'Untitled',
                imageUrl: imageUrl || null,
                authorId: existingAuthor.id,
                // Add location fields if they exist
                ...(location?.division && { division: location.division }),
                ...(location?.district && { district: location.district }),
                ...(location?.upazila && { thana: location.upazila }),
                ...(location?.union && { union: location.union }),
                ...(location?.postCode && { postCode: location.postCode }),
            },
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        });
        return res.status(201).json({
            message: 'News created successfully',
            news
        });
    }
    catch (error) {
        console.error('Error creating news:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createNews = createNews;
const getNews = async (req, res) => {
    try {
        const news = await prisma.news.findMany({
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                        image: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return res.status(200).json({ news });
    }
    catch (error) {
        console.error('Error fetching news:', error);
        return res.status(500).json({ error: 'Failed to fetch news' });
    }
};
exports.getNews = getNews;
const getSingleNews = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId; // Optional: for isLiked logic
        if (!id) {
            return res.status(400).json({ error: 'News ID is required' });
        }
        const news = await prisma.news.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                _count: {
                    select: {
                        Like: true,
                        Comment: true
                    }
                }
            }
        });
        if (!news) {
            return res.status(404).json({ error: 'News not found' });
        }
        // Check if user liked the news
        let isLiked = false;
        if (userId) {
            const liked = await prisma.like.findFirst({
                where: {
                    newsId: id,
                    userId: userId
                }
            });
            isLiked = !!liked;
        }
        // Construct custom response
        const formattedNews = {
            ...news,
            likesCount: news._count.Like,
            commentsCount: news._count.Comment,
            isLiked
        };
        return res.status(200).json(formattedNews);
    }
    catch (error) {
        console.error('Error fetching news:', error);
        return res.status(500).json({ error: 'Failed to fetch news' });
    }
};
exports.getSingleNews = getSingleNews;
const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'News ID is required' });
        }
        // Check if news exists
        const existingNews = await prisma.news.findUnique({
            where: { id }
        });
        if (!existingNews) {
            return res.status(404).json({ error: 'News not found' });
        }
        // Delete the news
        const deletedNews = await prisma.news.delete({
            where: { id }
        });
        return res.status(200).json({
            message: 'News deleted successfully',
            news: deletedNews
        });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'News not found' });
        }
        console.error('Error deleting news:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteNews = deleteNews;
const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id, 'up news params id');
        const { title, content, category, subCategory, keywords, subKeywords, imageUrl, imageSource, imageTitle, division, // Changed from location to direct fields
        district, thana, union, postCode } = req.body;
        console.log('Request Body:', req.body); // Detailed log
        if (!id) {
            return res.status(400).json({ error: 'News ID is required' });
        }
        // Check if news exists
        const existingNews = await prisma.news.findUnique({
            where: { id }
        });
        if (!existingNews) {
            return res.status(404).json({ error: 'News not found' });
        }
        // Prepare update data with proper location fields
        const updateData = {
            title: title || existingNews.title,
            content: content || existingNews.content,
            category: category || existingNews.category,
            subCategory: subCategory || existingNews.subCategory,
            keywords: keywords || existingNews.keywords,
            subKeywords: subKeywords || existingNews.subKeywords,
            imageUrl: imageUrl || existingNews.imageUrl,
            imageSource: imageSource || existingNews.imageSource,
            imageTitle: imageTitle || existingNews.imageTitle,
            division: division !== undefined ? division : existingNews.division,
            district: district !== undefined ? district : existingNews.district,
            thana: thana !== undefined ? thana : existingNews.thana,
            union: union !== undefined ? union : existingNews.union,
            postCode: postCode !== undefined ? postCode : existingNews.postCode,
        };
        console.log('Update Data:', updateData); // Log the data being sent to Prisma
        // Update news
        const updatedNews = await prisma.news.update({
            where: { id },
            data: updateData,
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        });
        return res.status(200).json({
            message: 'News updated successfully',
            news: updatedNews
        });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'News not found' });
        }
        console.error('Error updating news:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateNews = updateNews;
const addManyData = async (req, res) => {
    try {
        const newsItems = req.body;
        if (!Array.isArray(newsItems)) {
            return res.status(400).json({ message: 'Request body must be an array' });
        }
        // Ensure no relation objects like `author` are passed
        const result = await prisma.news.createMany({
            data: newsItems.map(({ author, ...rest }) => rest), // safely exclude `author` if mistakenly present
            skipDuplicates: true,
        });
        res.status(201).json({ message: 'Inserted successfully', insertedCount: result.count });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};
exports.addManyData = addManyData;
const deleteAllNews = async (req, res) => {
    try {
        await prisma.news.deleteMany(); // ⚠️ Deletes all records
        res.status(200).json({ message: 'All news entries deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};
exports.deleteAllNews = deleteAllNews;
const getHomePageNews = async (req, res) => {
    try {
        // Special news (latest single news)
        const specialNews = await prisma.news.findFirst({
            orderBy: { createdAt: 'desc' }
        });
        const categories = await prisma.news.findMany({
            select: {
                category: true,
            },
            distinct: ['category'],
            take: 9,
        });
        const galleryNews = await Promise.all(categories.map(async (cat) => {
            const latest = await prisma.news.findFirst({
                where: {
                    OR: [
                        { category: cat.category },
                        { subCategory: cat.category },
                    ],
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return latest;
        }));
        const filteredGalleryNews = galleryNews.filter(Boolean);
        // National News (latest 5)
        const nationalNews = await prisma.news.findMany({
            where: {
                OR: [
                    { category: 'জাতীয়' },
                    { subCategory: 'জাতীয়' }
                ]
            },
            orderBy: { updatedAt: 'desc' },
            take: 5,
        });
        const wholeCountry = await prisma.news.findMany({
            where: {
                OR: [
                    { category: 'সারাদেশ' },
                    { subCategory: 'সারাদেশ' },
                ]
            },
            orderBy: { updatedAt: 'desc' },
            take: 11,
        });
        const politicalNews = await prisma.news.findMany({
            where: {
                OR: [
                    { category: 'রাজনীতি' },
                    { subCategory: 'রাজনীতি' },
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 7,
        });
        const internationalNews = await prisma.news.findMany({
            where: {
                OR: [
                    { category: 'আন্তর্জাতিক' },
                    { subCategory: 'আন্তর্জাতিক' },
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 6,
        });
        const entertainment = await prisma.news.findMany({
            where: {
                OR: [
                    { category: 'বিনোদন' },
                    { subCategory: { in: ['বিনোদন', 'চলচ্চিত্র'] } },
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 7,
        });
        const encouraging = await prisma.news.findMany({
            where: {
                OR: [
                    { category: 'উৎসাহ' },
                    { subCategory: 'উৎসাহ' },
                ]
            },
            orderBy: { createdAt: 'desc' },
        });
        const sports = await prisma.news.findMany({
            where: {
                OR: [
                    { category: 'খেলাধুলা' },
                    { subCategory: 'খেলাধুলা' },
                ]
            },
            take: 8,
            orderBy: { createdAt: 'desc' },
        });
        const opinions = await prisma.opinion.findMany({
            where: {
                status: 'APPROVED',
                OR: [
                    { category: 'মতামত' },
                    { subCategory: 'মতামত' },
                ],
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        });
        const islamicNews = await prisma.news.findMany({
            where: {
                OR: [
                    { category: 'ইসলাম' },
                    { subCategory: 'ইসলাম' },
                ]
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
        });
        const maxim = await prisma.news.findFirst({
            where: { category: 'বাণী' },
            orderBy: { createdAt: 'desc' }
        });
        const categoriesForLatest = {
            doctor: 'ডাক্তার আছেন',
            science: 'বিজ্ঞান ও প্রযুক্তি',
            probash: 'পরবাস',
            education: 'শিক্ষা',
            // tech: 'প্রযুক্তি',
        };
        const latestNewsFromDifferentCategories = {};
        for (const key in categoriesForLatest) {
            const categoryKey = key;
            latestNewsFromDifferentCategories[categoryKey] = await prisma.news.findMany({
                where: {
                    category: categoriesForLatest[categoryKey],
                },
                orderBy: { createdAt: 'desc' },
                take: 3,
                select: {
                    id: true,
                    category: true,
                    title: true,
                    imageUrl: true,
                },
            });
        }
        const transformed = Object.entries(latestNewsFromDifferentCategories).map(([key, newsArray]) => {
            const categoryTitle = categoriesForLatest[key];
            return {
                title: categoryTitle,
                imageUrl: newsArray[0]?.imageUrl || '',
                headlines: newsArray.map(news => ({
                    id: news.id,
                    category: news.category,
                    title: news.title
                })),
            };
        });
        const funCategories = ['স্বাস্থ্য', 'ভ্রমণ', 'কৃষি', 'প্রযুক্তি', 'বিজ্ঞান', 'জীবনধারা', 'প্রত্নতত্ত্ব'];
        const featuredCategoryNames = ['স্বাস্থ্য', 'ভ্রমণ', 'জীবনধারা'];
        // Step 1: Get all news from fun categories
        const allFunNews = await prisma.news.findMany({
            where: {
                category: { in: funCategories },
            },
            select: {
                id: true,
                title: true,
                category: true,
                imageUrl: true,
                createdAt: true,
                content: true
            },
        });
        // Step 2: Count per category
        const categoryCounts = {};
        for (const cat of funCategories) {
            categoryCounts[cat] = allFunNews.filter(news => news.category === cat).length;
        }
        // Step 3: Pick 1 random item from each category
        const categoryStats = funCategories.map(cat => {
            const itemsInCat = allFunNews.filter(news => news.category === cat);
            const randomItem = itemsInCat[Math.floor(Math.random() * itemsInCat.length)];
            return {
                ...randomItem,
                count: categoryCounts[cat],
                categoryTitle: `${cat} সম্পর্কিত খবর`,
            };
        });
        // Step 4: Pick one additional randomNews (excluding already selected)
        const remainingForRandom = allFunNews.filter(news => !categoryStats.find(item => item.id === news.id));
        const randomPool = remainingForRandom.length > 0 ? remainingForRandom : allFunNews;
        const randomNews = randomPool[Math.floor(Math.random() * randomPool.length)];
        //  Step 5: Custom featuredCategories
        function getRandomItemsFromCategory(cat, count) {
            const items = allFunNews.filter(news => news.category === cat);
            const shuffled = [...items].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        }
        const featuredCategories = [
            ...getRandomItemsFromCategory('স্বাস্থ্য', 2),
            ...getRandomItemsFromCategory('ভ্রমণ', 3),
            ...getRandomItemsFromCategory('জীবনধারা', 2),
        ];
        const funNews = {
            randomNews,
            categoryStats,
            featuredCategories,
        };
        const allFunNewsforBottom = await prisma.news.findMany({
            where: {
                category: { in: funCategories },
            },
            select: {
                id: true,
                title: true,
                category: true,
                imageUrl: true,
                createdAt: true,
                content: true
            },
            take: 4
        });
        // Final response
        res.status(200).json({
            specialNews,
            allFunNewsforBottom,
            nationalNews,
            islamicNews,
            maxim,
            wholeCountry,
            politicalNews,
            internationalNews,
            entertainment,
            sports,
            encouraging,
            opinions,
            galleryNews,
            transformed,
            funNews
        });
    }
    catch (error) {
        console.error('Failed to fetch homepage news:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : error,
        });
    }
};
exports.getHomePageNews = getHomePageNews;
const getTitleForDescription = async (req, res) => {
    try {
        const category = req.params.category;
        const news = await prisma.news.findMany({
            where: {
                OR: [
                    { category: category },
                    { subCategory: category },
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 7
        });
        res.status(200).json({
            categorizedNews: news
        });
    }
    catch (error) {
        console.error('Failed to fetch homepage news:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : error,
        });
    }
};
exports.getTitleForDescription = getTitleForDescription;
const getCategorizedNews = async (req, res) => {
    try {
        const { category } = req.params;
        // console.log(category,'cate params');
        const skip = parseInt(req.query.skip) || 0;
        const take = parseInt(req.query.take) || 15;
        const decodedCategory = req.params.category;
        const news = await prisma.news.findMany({
            where: {
                OR: [
                    { category: decodedCategory },
                    { subCategory: decodedCategory },
                ]
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
            include: {
                author: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            }
        });
        const totalCount = await prisma.news.count({
            where: {
                OR: [
                    { category: decodedCategory },
                    { subCategory: decodedCategory },
                ]
            }
        });
        res.status(200).json({
            success: true,
            data: news,
            hasMore: skip + take < totalCount,
            totalCount
        });
    }
    catch (error) {
        console.error(`Failed to fetch categorized news:`, error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getCategorizedNews = getCategorizedNews;
const getNewsForDashboard = async (req, res) => {
    try {
        /* ---------- read query params ---------- */
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);
        const search = req.query.search ?? '';
        const category = req.query.category ?? '';
        const subCategory = req.query.subCategory ?? '';
        /* ---------- build dynamic filters ---------- */
        const filters = [];
        if (search)
            filters.push({
                title: { contains: search, mode: 'insensitive' },
            });
        if (category)
            filters.push({ category }); // equals string OK
        if (subCategory)
            filters.push({ subCategory });
        /*  if filters array empty => {}  else => { AND: [...] }  */
        const where = filters.length ? { AND: filters } : {};
        /* ---------- query + count in parallel ---------- */
        const [news, total] = await Promise.all([
            prisma.news.findMany({
                where,
                include: {
                    author: { select: { name: true, email: true, image: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.news.count({ where }),
        ]);
        /* ---------- success response ---------- */
        res.status(200).json({
            success: true,
            data: news,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch news',
        });
    }
};
exports.getNewsForDashboard = getNewsForDashboard;
const getLatestAndMostReadNews = async (req, res) => {
    try {
        const latestNews = await prisma.news.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            take: 7,
        });
        const mostReadNews = await prisma.news.findMany({
            orderBy: {
                views: 'desc',
            },
            take: 7,
        });
        res.status(200).json({
            latest: latestNews,
            mostRead: mostReadNews,
        });
    }
    catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ message: 'Server error fetching news' });
    }
};
exports.getLatestAndMostReadNews = getLatestAndMostReadNews;
const incrementNewsView = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.news.update({
            where: { id },
            data: { views: { increment: 1 } },
        });
        res.status(200).json({ message: 'View incremented' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update views' });
    }
};
exports.incrementNewsView = incrementNewsView;
// not hold starts
const convertBengaliDateToEnglish = (input) => {
    const bengaliDigits = {
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
        '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    };
    const monthMap = {
        'জানুয়ারি': 'January',
        'ফেব্রুয়ারি': 'February',
        'মার্চ': 'March',
        'এপ্রিল': 'April',
        'মে': 'May',
        'জুন': 'June',
        'জুলাই': 'July',
        'আগস্ট': 'August',
        'সেপ্টেম্বর': 'September',
        'অক্টোবর': 'October',
        'নভেম্বর': 'November',
        'ডিসেম্বর': 'December',
    };
    let converted = input;
    Object.entries(bengaliDigits).forEach(([bn, en]) => {
        converted = converted.replace(new RegExp(bn, 'g'), en);
    });
    Object.entries(monthMap).forEach(([bn, en]) => {
        converted = converted.replace(bn, en);
    });
    return converted;
};
const getSearchNews = async (req, res) => {
    try {
        const { keyword, date, category, subCategory, page = 1, limit = 9 } = req.query;
        console.log(req.query);
        const filters = { AND: [] };
        // Keyword search
        if (keyword) {
            filters.AND.push({
                OR: [
                    { title: { contains: keyword.toString(), mode: 'insensitive' } },
                    { content: { contains: keyword.toString(), mode: 'insensitive' } },
                ],
            });
        }
        // Bengali date filter
        if (date) {
            const englishDate = convertBengaliDateToEnglish(date.toString());
            const selectedDate = new Date(englishDate);
            if (!isNaN(selectedDate.getTime())) {
                const nextDate = new Date(selectedDate);
                nextDate.setDate(selectedDate.getDate() + 1);
                filters.AND.push({
                    createdAt: {
                        gte: selectedDate,
                        lt: nextDate,
                    },
                });
            }
        }
        // Category filters
        if (category) {
            filters.AND.push({ category: { equals: category.toString() } });
        }
        if (subCategory) {
            filters.AND.push({ subCategory: { equals: subCategory.toString() } });
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [news, total] = await Promise.all([
            prisma.news.findMany({
                where: filters,
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.news.count({ where: filters }),
        ]);
        res.json({
            success: true,
            total,
            page: Number(page),
            limit: Number(limit),
            news,
        });
    }
    catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getSearchNews = getSearchNews;
const getSearchNewsdpsk = async (req, res) => {
    try {
        const { query = '', author = '', category = '', type = '', date = '', sort = 'relevance', page = 1, limit = 10 } = req.query;
        console.log(req.query, 'df');
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;
        // Build the where clause for Prisma
        const where = {};
        // Text search (title or content)
        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } }
            ];
        }
        // Author filter
        if (author) {
            where.author = {
                name: { contains: author, mode: 'insensitive' }
            };
        }
        // Category filter
        if (category) {
            where.category = category;
        }
        // Type filter (assuming 'type' is stored in subCategory)
        if (type) {
            where.subCategory = type;
        }
        // Date filter
        if (date) {
            const dateObj = new Date(date);
            const nextDay = new Date(dateObj);
            nextDay.setDate(dateObj.getDate() + 1);
            where.createdAt = {
                gte: dateObj,
                lt: nextDay
            };
        }
        // Determine order by based on sort parameter
        let orderBy = {};
        if (sort === 'latest') {
            orderBy = { createdAt: 'desc' };
        }
        else if (sort === 'popular') {
            orderBy = { views: 'desc' };
        }
        else {
            // Relevance - we'll use full-text search if available
            // For Prisma, we can sort by text similarity if using PostgreSQL
            // Otherwise, we'll fall back to createdAt
            orderBy = { createdAt: 'desc' };
        }
        // Get total count for pagination
        const total = await prisma.news.count({ where });
        // Get the news items
        const news = await prisma.news.findMany({
            where,
            include: {
                author: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy,
            skip,
            take: limitNumber
        });
        // console.log(news);
        res.json({
            news,
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / limitNumber)
        });
    }
    catch (error) {
        console.error('Error in getSearchNews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getSearchNewsdpsk = getSearchNewsdpsk;
