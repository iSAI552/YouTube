import mongoose, {isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    if(!(await Video.findById(videoId))) throw new ApiError(404, "Video not found")

    const comments = await Comment.aggregatePaginate([
        { $match: 
            { 
                video: videoId
            } 
        },
        {
            $lookup: {
                from: 'users', // replace 'users' with your actual User collection name
                localField: 'owner',
                foreignField: '_id',
                as: 'owner'
            }
        },
        {
            $project: {
                owner: 1,
                video: 1,
                content: 1,
                createdAt: 1,
                updatedAt: 1,
            }
        },
        { $sort: { createdAt: -1 } }
    ], { page, limit });

    if(!comments) throw new ApiError(500, "Comments could not be fetched")

    return res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    )


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    if(!(await Video.findById(videoId))) throw new ApiError(404, "Video not found")

    const comment = await Comment.create({
        owner: req.user._id,
        video: videoId,
        content
    })

    if(!comment) throw new ApiError(500, "Comment could not be created")

    return res.status(201).json(
        new ApiResponse(201, comment, "Comment created successfully")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId")
    }

    const comment = await Comment.findById(commentId)
    if(!comment) throw new ApiError(404, "Comment not found")

    if(comment.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "You are not authorized to update this comment")

    comment.content = content
    await comment.save()

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    )
   

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId")
    }
    const comment = await Comment.findById(commentId)
    if(!comment) throw new ApiError(404, "Comment not found")
    if(comment.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "You are not authorized to delete this comment")

    Comment.deleteOne({_id: commentId}).catch(err => {
        throw new ApiError(500,err, "Comment could not be deleted")
    })

    return res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully")
    )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }
