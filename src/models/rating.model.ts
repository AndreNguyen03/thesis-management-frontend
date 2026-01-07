export interface RatingDistribution {
	[key: number]: number
}
export interface Rating {
	averageRating: number
	totalRatings: number
	distribution: RatingDistribution
}
export interface RatingDetail {
    topicId: string
    userId: string
    rating: number // 1-5 stars
    comment?: string
    createdAt: Date
    updatedAt: Date
}
// Object.entries(rating.distribution).forEach(([score, count]) => {
//     console.log(`Điểm ${score}: ${count} lượt`);
// });


export interface CreateRatingPayload {
	topicId: string
	rating: number
	comment?: string
}
