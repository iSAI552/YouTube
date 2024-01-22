import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    
    const stats = await Video.aggregate([
        {
            $match: {
              owner: new mongoose.Types.ObjectId(req.user._id),
            },
          },
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
          {
            $addFields: {
              likes: {
                $size: { $ifNull: ["$likes", []] },
              },
            },
          },
          {
            $lookup: {
              from: "subscriptions",
              localField: "owner",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribers: {
                $size: { $ifNull: ["$subscribers", []] },
              },
            },
          },
          {
            $group: {
              _id: null,
              totalViews: {
                $sum: "$views",
              },
              totalVideos: {
                $count: {},
              },
    
              totalLikes: {
                $sum: "$likes",
              },
                totalSubscribers: {
                    $sum: "$subscribers",
                },
            },
          },
          {
            $project: {
              _id: 0,
              owner: 0,
            },
          },
        ]);

    if (!stats) throw new ApiError(500, "Error while fetching the dashboard Channel Stats")

    return res.status(200).json(
        new ApiResponse(
            200,
            stats,
            "Channel Stats fetched successfully"
        )
    )

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const myVideos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])

    if(!myVideos) throw new ApiError(404, "No videos found")

    return res.status(200).json(
        new ApiResponse(
            200,
            myVideos,
            "Channel videos fetched successfully"
        )
    )

})

export {
    getChannelStats, 
    getChannelVideos
    }