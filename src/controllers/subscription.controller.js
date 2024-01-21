import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel id")

    const channel = await User.findById(channelId)
    if(!channel) throw new ApiError(404, "Channel not found")

    const alreadySubscribed = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if(alreadySubscribed){
        await Subscription.deleteOne({ _id : alreadySubscribed._id })
        .then(() => (
            res.status(200).json(
                new ApiResponse(200, null, "Unsubscribed successfully")
            )
        ))
        .catch(err => {
            throw new ApiError(500,err, "Something went wrong while unsubscribing")
        })
    } else {
        await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })
        .then(() => (
            res.status(200).json(
                new ApiResponse(200, null, "Subscribed successfully")
        )))
        .catch(err => {
            throw new ApiError(500, err, "Something went wrong while subscribing")
        })
    
    }



})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel id")

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)  
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                subscribersCount: { $size: "$subscribers" }
            }
        },
        {
            $project: {
                subscriber: 1,
                subscribersCount: 1,
                "subscribers.username": 1,
                "subscribers.avatar": 1,
                "subscribers.coverImage": 1,
                
            }
        }
    ])

    if(!subscribers?.length){
        throw new ApiError(404, "Channel not found")
    }

    return res.status(200).json(
        new ApiResponse(200,subscribers[0] ,"Subscribers fetched successfully")
    )
        
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params
    if(!isValidObjectId(subscriberId)) throw new ApiError(400, "Invalid subscriber id")

    const channelsList = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribedToCount: { $size: "$subscribedTo" }
            }
        },
        {
            $project: {
                channel: 1,
                subscribedToCount: 1,
                "subscribedTo.username": 1,
                "subscribedTo.avatar": 1,
                "subscribedTo.coverImage": 1,
                
            }
        },
        
    ])

    if(!channelsList?.length){
        throw new ApiError(404, "User not found")
    }

    return res.status(200).json(
        new ApiResponse(200, channelsList[0], "Subscribed channels fetched successfully")
    )

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}