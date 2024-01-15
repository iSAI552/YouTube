import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {tweetContent} = req.body

    const tweet = await Tweet.create({
        owner: req.user._id,
        content: tweetContent
    })

    if(!tweet) throw new ApiError(500, "Something went wrong while creating the Tweet")

    return res.status(200).json(
        new ApiResponse(200, tweet, "Tweet was created Successfully")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    // find all the tweets that belong to the user with userId using aggregation pipeline
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
    ])

    if(!tweets) throw new ApiError(404, "No tweets found for this user")

    return res.status(200).json(
        new ApiResponse(200,tweets[0], "Tweets were found successfully")
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {tweetContent} = req.body

    const tweet = await Tweet.findById(tweetId)

    if(!tweet) throw new ApiError(404, "Tweet not found")

    // check if the tweetId owner is the same as the logged in user
    if(req.user._id.toString() !== tweet.owner.toString()) throw new ApiError(401, "You are not authorized to perform this action")
    // The above code is important because we used .toString() to convert the ObjectId to a string for both lhs and rhs because
    // even though both contains new ObjectId('65a4e1e64b530660b7dba1cf') but these are not same because they are different objects as
    // new keyword is used to create a new object. So, we need to convert them to string to compare them.

    tweet.content = tweetContent
    await tweet.save()

    return res.status(200).json(
        new ApiResponse(200, tweet, "Tweet was updated successfully")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    const tweet = await Tweet.findById(tweetId)

    if(!tweet) throw new ApiError(404, "Tweet not found")

    // check if the tweetId owner is the same as the logged in user
    if(req.user._id.toString() !== tweet.owner.toString()) throw new ApiError(401, "You are not authorized to perform this action")
    if(req.user._id.toString() !== tweet.owner.toString()) throw new ApiError(401, "You are not authorized to perform this action")

    Tweet.deleteOne({_id: tweetId}).catch(err => {
        throw new ApiError(500, "Something went wrong while deleting the Tweet")
    })

    return res.status(200).json(
        new ApiResponse(200,"Tweet was deleted successfully")
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
