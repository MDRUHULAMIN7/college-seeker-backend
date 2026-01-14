// controllers/recommendation.controller.ts
import type { Request, Response } from 'express';
import { Library } from '../library/library.model.js';
import { Book } from '../book/book.model.js';
import Review from '../review/review.model.js';
import mongoose, { type PipelineStage } from 'mongoose';
import { User } from '../user/user.model.js';



interface BookRecommendation {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  genre: { _id: string; name: string };
  avgRating: number;
  shelvedCount: number;
  reason?: string;
}

export const getPersonalizedRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const limit = parseInt(req.query.limit as string) || 18;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    //  Get user's reading history from "read" shelf
    const readBooks = await Library.find({
      user: userId,
      shelf: 'read',
    }).populate('book', 'genre');

    const readBookIds = readBooks.map(item => item.book._id);
    const hasEnoughHistory = readBooks.length >= 3;

    let recommendations: BookRecommendation[] = [];

    if (hasEnoughHistory) {
      // PERSONALIZED RECOMMENDATIONS
      
      //  Analyze user's genre preferences
      const genreCounts: Record<string, number> = {};
      readBooks.forEach(item => {
        const genreId = (item.book as any).genre.toString();
        genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
      });

      const topGenres = Object.entries(genreCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([genreId]) => new mongoose.Types.ObjectId(genreId));

      // Step 3: Get user's average rating given
      const userReviews = await Review.find({ userId });
      const avgUserRating = userReviews.length > 0
        ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length
        : 4.0;

      // Step 4: Build recommendation pipeline
      const pipeline: PipelineStage[] = [
        // Exclude already read books
        {
          $match: {
            _id: { $nin: readBookIds },
            genre: { $in: topGenres },
          },
        },
        // Lookup genre details
        {
          $lookup: {
            from: 'genres',
            localField: 'genre',
            foreignField: '_id',
            as: 'genreDetails',
          },
        },
        { $unwind: '$genreDetails' },
        // Lookup approved reviews
        {
          $lookup: {
            from: 'reviews',
            let: { bookId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$bookId', '$bookId'] },
                  status: 'approved',
                },
              },
            ],
            as: 'reviews',
          },
        },
        // Calculate rating
        {
          $addFields: {
            avgRating: {
              $cond: {
                if: { $gt: [{ $size: '$reviews' }, 0] },
                then: { $avg: '$reviews.rating' },
                else: 0,
              },
            },
            reviewCount: { $size: '$reviews' },
          },
        },
        // Lookup library entries to count shelves
        {
          $lookup: {
            from: 'libraries',
            localField: '_id',
            foreignField: 'book',
            as: 'shelves',
          },
        },
        {
          $addFields: {
            shelvedCount: { $size: '$shelves' },
          },
        },
        // Filter: must have decent rating or be popular
        {
          $match: {
            $or: [
              { avgRating: { $gte: avgUserRating - 0.5 } },
              { shelvedCount: { $gte: 5 } },
            ],
          },
        },
        // Calculate recommendation score
        {
          $addFields: {
            score: {
              $add: [
                { $multiply: ['$avgRating', 0.4] },
                { $multiply: [{ $min: ['$reviewCount', 20] }, 0.3] },
                { $multiply: [{ $min: ['$shelvedCount', 50] }, 0.3] },
              ],
            },
          },
        },
        // Sort by score
        { $sort: { score: -1, avgRating: -1 } },
        { $limit: limit },
        // Project final shape
        {
          $project: {
            title: 1,
            author: 1,
            coverImage: 1,
            genre: {
              _id: '$genreDetails._id',
              name: '$genreDetails.name',
            },
            avgRating: 1,
            shelvedCount: 1,
            reviewCount: 1,
            score: 1,
          },
        },
      ];

      const recommendedBooks = await Book.aggregate(pipeline);

      // Add personalized reasons
      recommendations = recommendedBooks.map((book: any) => {
        const genreCount = genreCounts[book.genre._id.toString()] || 0;
        let reason = '';

        if (genreCount >= 3) {
          reason = `Matches your love for ${book.genre.name} (${genreCount} books read)`;
        } else if (book.avgRating >= 4.5) {
          reason = `Highly rated (${book.avgRating.toFixed(1)}★) in ${book.genre.name}`;
        } else if (book.shelvedCount >= 20) {
          reason = `Popular in ${book.genre.name} (${book.shelvedCount} readers)`;
        } else {
          reason = `Recommended based on your ${book.genre.name} preference`;
        }

        return {
          _id: book._id,
          title: book.title,
          author: book.author,
          coverImage: book.coverImage,
          genre: book.genre,
          avgRating: book.avgRating,
          shelvedCount: book.shelvedCount,
          reason,
        };
      });
    }

    // FALLBACK: If not enough personalized recommendations
    if (recommendations.length < limit) {
      const needed = limit - recommendations.length;
      const excludeIds = [
        ...readBookIds,
        ...recommendations.map(r => new mongoose.Types.ObjectId(r._id)),
      ];

      const fallbackPipeline: PipelineStage[] = [
        { $match: { _id: { $nin: excludeIds } } },
        {
          $lookup: {
            from: 'genres',
            localField: 'genre',
            foreignField: '_id',
            as: 'genreDetails',
          },
        },
        { $unwind: '$genreDetails' },
        {
          $lookup: {
            from: 'reviews',
            let: { bookId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$bookId', '$bookId'] },
                  status: 'approved',
                },
              },
            ],
            as: 'reviews',
          },
        },
        {
          $addFields: {
            avgRating: {
              $cond: {
                if: { $gt: [{ $size: '$reviews' }, 0] },
                then: { $avg: '$reviews.rating' },
                else: 0,
              },
            },
          },
        },
        {
          $lookup: {
            from: 'libraries',
            localField: '_id',
            foreignField: 'book',
            as: 'shelves',
          },
        },
        {
          $addFields: {
            shelvedCount: { $size: '$shelves' },
          },
        },
        // Mix of popular and random
        {
          $addFields: {
            randomScore: { $rand: {} },
            popularityScore: {
              $add: [
                { $multiply: ['$avgRating', 0.6] },
                { $multiply: [{ $min: ['$shelvedCount', 30] }, 0.4] },
              ],
            },
          },
        },
        {
          $sort: {
            popularityScore: -1,
            randomScore: -1,
          },
        },
        { $limit: needed },
        {
          $project: {
            title: 1,
            author: 1,
            coverImage: 1,
            genre: {
              _id: '$genreDetails._id',
              name: '$genreDetails.name',
            },
            avgRating: 1,
            shelvedCount: 1,
          },
        },
      ];

      const fallbackBooks = await Book.aggregate(fallbackPipeline);

      const fallbackRecommendations = fallbackBooks.map((book: any) => ({
        ...book,
        reason: book.avgRating >= 4.0
          ? `Popular pick with ${book.avgRating.toFixed(1)}★ rating`
          : `Discover ${book.genre.name}`,
      }));

      recommendations = [...recommendations, ...fallbackRecommendations];
    }

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        isPersonalized: hasEnoughHistory,
        booksRead: readBooks.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate recommendations',
    });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      totalBooks,
      totalUsers,
      totalReviews,
      pendingReviews,
      booksPerGenre,
      recentUsers,
      topRatedBooks,
      shelfDistribution,
    ] = await Promise.all([
      // Total counts
      Book.countDocuments(),
      User.countDocuments(),
      Review.countDocuments(),
      Review.countDocuments({ status: 'pending' }),

      // Books per genre aggregation
      Book.aggregate([
        {
          $group: {
            _id: '$genre',
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'genres',
            localField: '_id',
            foreignField: '_id',
            as: 'genreInfo',
          },
        },
        {
          $unwind: '$genreInfo',
        },
        {
          $project: {
            _id: 0,
            genre: '$genreInfo.name',
            count: 1,
          },
        },
        {
          $sort: { count: -1 },
        },
      ]),

      // Recent users (last 7 days)
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),

      // Top rated books
      Review.aggregate([
        { $match: { status: 'approved' } },
        {
          $group: {
            _id: '$bookId',
            avgRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
          },
        },
        { $sort: { avgRating: -1, totalReviews: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'books',
            localField: '_id',
            foreignField: '_id',
            as: 'book',
          },
        },
        { $unwind: '$book' },
        {
          $project: {
            title: '$book.title',
            avgRating: { $round: ['$avgRating', 1] },
            totalReviews: 1,
          },
        },
      ]),

      // Shelf distribution
      Library.aggregate([
        {
          $group: {
            _id: '$shelf',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            shelf: {
              $switch: {
                branches: [
                  { case: { $eq: ['$_id', 'want'] }, then: 'Want to Read' },
                  { case: { $eq: ['$_id', 'reading'] }, then: 'Currently Reading' },
                  { case: { $eq: ['$_id', 'read'] }, then: 'Read' },
                ],
                default: '$_id',
              },
            },
            count: 1,
          },
        },
      ]),
    ]);

    // Monthly books added (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBooks = await Book.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              {
                $switch: {
                  branches: [
                    { case: { $eq: ['$_id.month', 1] }, then: 'Jan' },
                    { case: { $eq: ['$_id.month', 2] }, then: 'Feb' },
                    { case: { $eq: ['$_id.month', 3] }, then: 'Mar' },
                    { case: { $eq: ['$_id.month', 4] }, then: 'Apr' },
                    { case: { $eq: ['$_id.month', 5] }, then: 'May' },
                    { case: { $eq: ['$_id.month', 6] }, then: 'Jun' },
                    { case: { $eq: ['$_id.month', 7] }, then: 'Jul' },
                    { case: { $eq: ['$_id.month', 8] }, then: 'Aug' },
                    { case: { $eq: ['$_id.month', 9] }, then: 'Sep' },
                    { case: { $eq: ['$_id.month', 10] }, then: 'Oct' },
                    { case: { $eq: ['$_id.month', 11] }, then: 'Nov' },
                    { case: { $eq: ['$_id.month', 12] }, then: 'Dec' },
                  ],
                },
              },
              ' ',
              { $toString: '$_id.year' },
            ],
          },
          count: 1,
        },
      },
    ]);

    // User role distribution
    const userRoles = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          role: { $toUpper: '$_id' },
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalBooks,
          totalUsers,
          totalReviews,
          pendingReviews,
          recentUsers,
        },
        charts: {
          booksPerGenre,
          monthlyBooks,
          shelfDistribution,
          userRoles,
          topRatedBooks,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};