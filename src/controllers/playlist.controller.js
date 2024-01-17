import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(name?.trim() === "" || description?.trim() === "") throw new ApiError(400, "Playlist name & description cannot be empty")

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    if(!playlist) throw new ApiError(500, "Failed to create playlist")

    return res.status(201).json(new ApiResponse(201, {playlist}, "Playlist created successfully"))


    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id")

    if(userId.toString() !== req.user._id.toString()) throw new ApiError(403, "You are not authorized to access this resource")

    const playlists = await Playlist.find({owner: userId})
    
    if(!playlists) throw new ApiError(404, "No playlists found")

    return res.status(200).json(new ApiResponse(200, {playlists}, "User playlists fetched successfully"))
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist id")

    const playlist = await Playlist.findById(playlistId).populate("videos")

    if(!playlist) throw new ApiError(404, "Playlist not found")

    if(playlist.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "You are not authorized to access this resource")

    return res.status(200).json(new ApiResponse(200, {playlist}, "Playlist fetched successfully"))


})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid playlist id or video id")

    const playlist = await Playlist.findById({_id: playlistId, owner: req.user._id})
    if(!playlist) throw new ApiError(404, "Playlist not found")
    try {
        playlist.videos.push(videoId)
        await playlist.save()
    } catch (error) {
        throw new ApiError(500,error, "Failed to add video to playlist")
    }

    return res.status(200).json(new ApiResponse(200, {playlist}, "Video added to playlist successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid playlist id or video id")

    const playlist = await Playlist.findById({_id: playlistId, owner: req.user._id})
    if(!playlist) throw new ApiError(404, "Playlist not found")

    if(!playlist.videos.includes(videoId)) throw new ApiError(400, "Video not found in playlist")

    try {
        playlist.videos.pull(videoId)
        await playlist.save()
    } catch (error) {
        throw new ApiError(500,error, "Failed to remove video from playlist")
    }

    return res.status(200).json(new ApiResponse(200, {playlist}, "Video removed from playlist successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist id")
    const playlist = await Playlist.findById({_id: playlistId, owner: req.user._id})
    if(!playlist) throw new ApiError(404, "Playlist not found")

    Playlist.deleteOne({_id: playlistId})
    .then(() => {
        return res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully"))
    })
    .catch(error => {
        throw new ApiError(500, error, "Failed to delete playlist")
    })

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(name?.trim() === "" || description?.trim() === "") throw new ApiError(400, "Playlist name & description cannot be empty")
    if(!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist id")
    const playlist = await Playlist.findOneAndUpdate(
        {_id: playlistId, owner: req.user._id}, // Find the playlist by id and owner
        {name, description}, // Update the name and description
        {new: true} // Return the updated playlist
    )
    if(!playlist) throw new ApiError(404, "Playlist not found")
    
    return res.status(200).json(new ApiResponse(200, {playlist}, "Playlist updated successfully"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
