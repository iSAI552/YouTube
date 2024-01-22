import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
import {Tweet} from "../models/tweet.model.js"
import {Comment} from "../models/comment.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    if(!video.isPublished){
        throw new ApiError(403, "Video not published")
    }

    const likeDoc = await Like.findOne({video: videoId, likedBy: req.user._id})

    if(!likeDoc) {
        Like.create({
            video: videoId,
            likedBy: req.user._id
        })
    } else{
        Like.deleteOne({_id: likeDoc._id}).catch(err => {
            throw new ApiError(500, "Error while disliking video")
        })
    }
    if(likeDoc){
        return res.status(200).json(
            new ApiResponse(200, "Video Disliked Successfully")
        )
    } else{
        return res.status(200).json(
            new ApiResponse(200, "Video Liked Successfully")
        )}

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment id")
    }

    const comment = Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

    const likeDoc = await Like.findOne({comment: commentId, likedBy: req.user._id})

    if(!likeDoc) {
        Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
    } else{
        Like.deleteOne({_id: likeDoc._id}).catch(err => {
            throw new ApiError(500, "Error while disliking comment")
        })
    }

    if(likeDoc){
        return res.status(200).json(
            new ApiResponse(200, "Comment Disliked Successfully")
        )
    } else{
        return res.status(200).json(
            new ApiResponse(200, "Comment Liked Successfully")
        )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }
    const likeDoc = await Like.findOne({tweet: tweetId, likedBy: req.user._id})

    if(!likeDoc) {
        Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
        
    } else{
        Like.deleteOne({_id: likeDoc._id}).catch(err => {
            throw new ApiError(500, err , "Error while disliking tweet")
        })
    }

    if(likeDoc){
        return res.status(200).json(
            new ApiResponse(200, "Tweet Disliked Successfully")
        )
    } else{
        return res.status(200).json(
            new ApiResponse(200, "Tweet Liked Successfully")
        )
    }

})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: {$exists: true}
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            
            }
        },
        // {
        //     $project: {
        //         videoFile:1,
        //     }
        // }
    ])

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked Videos fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}