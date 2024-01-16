import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { removeTempFilesSync } from "../utils/removeTemp.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!(videoLocalPath && thumbnailLocalPath)) {
        removeTempFilesSync()
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!(videoFile && thumbnail)) {
        removeTempFilesSync()
        throw new ApiError(500, "Error while uploading Video and Thumbnail files")
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: Math.round(videoFile.duration),
        owner: req.user._id
    })

    if (!video) {
        removeTempFilesSync()
        throw new ApiError(500, "Error while publishing video")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            video,
            "Video published successfully"
        )
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }
    const video = await Video.findById(videoId)

    if (!video) throw new ApiError(404, "Video not found")
    if (!video.isPublished) throw new ApiError(403, "Video not published")

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video retrieved successfully"
        )
    )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        removeTempFilesSync()
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        removeTempFilesSync()
        throw new ApiError(403, "You are not allowed to update this video")
    }

    const { title, description } = req.body
    const thumbnailLocalPath = req.file?.path

    if (!thumbnailLocalPath && !title && !description) {
        removeTempFilesSync()
        throw new ApiError(400, "Nothing to update")
    }

    if (title) video.title = title
    if (description) video.description = description
    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if (!thumbnail) {
            removeTempFilesSync()
            throw new ApiError(500, "Error while uploading thumbnail")
        }
        video.thumbnail = thumbnail.url
    }

    try {
        await video.save({ validateBeforeSave: false })
    } catch (error) {
        removeTempFilesSync()
        throw new ApiError(500, "Error while updating video")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video updated successfully"
        )
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")
    if (video.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "You are not allowed to delete this video")
    Video.deleteOne({ _id: videoId }).catch(error => {
        throw new ApiError(500, error, "Error while deleting video")
    })
    return res.status(200).json(
        new ApiResponse(
            200,
            "Video deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to toggle Publish Status this video")
    }

    video.isPublished = !video.isPublished
    try {
        await video.save({ validateBeforeSave: false })
    } catch (error) {
        throw new ApiError(500, "Error while toggling publish status")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video publish status toggled successfully"
        )
    )

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
