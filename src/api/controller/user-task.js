const createError = require('http-errors');
const _ = require('lodash');
const { userTaskService } = require('../service');
const { globalContext } = require('../../context');

const ytbPlaylistPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:playlist\?list=|watch\?.*?list=)([a-zA-Z0-9_-]+)/;
const ytbVideoPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

const isYtbUrl = (url) => {
	const match = url.match(ytbVideoPattern);
	return match ? match[1] : undefined;
};

const isYtbPlaylistUrl = (url) => {
	const match = url.match(ytbPlaylistPattern);
	return match ? match[1] : undefined;
};

const playlistLength = async (req, res, next) => {
	try {
		const { playlistUrl = '', removeDuplicated = true, sort = true, start = 0, end } = req.query;
		const playlistId = isYtbPlaylistUrl(playlistUrl);
		if (!playlistId) {
			next(createError(400, { message: `Đầu vào không hợp lệ, chỉ chấp nhận một đường dẫn đến danh sách phát Youtube.` }));
			return;
		}
		const youtube = globalContext.get('google').youtube({ version: 'v3' });
		// prettier-ignore
		const [duration, ids] = await userTaskService.playlistLength(youtube, { playlistId, removeDuplicated, sort, start, end });
		res.json({ message: `Truy vấn thông tin danh sách phát thành công.`, data: { duration, ids } });
	} catch (error) {
		if (error instanceof createError.HttpError) throw error;
		next(createError(500, { message: `Không thể lấy thông tin về danh sách phát ngay bây giờ, thử lại sau.` }));
	}
};

const createPlaylist = async (req, res, next) => {
	try {
		const { videoIds = [], title, description, defaultLanguage = 'vi', isPublic = true } = req.query;
		if (_.isEmpty(title) || _.isEmpty(description)) {
			next(createError(400, { message: `Đầu vào không hợp lệ, tên và mô tả danh sách phát không được phép trống.` }));
			return;
		}
		const ids = (Array.isArray(videoIds) ? videoIds : [videoIds]).filter((v) => isYtbUrl(v));
		const youtube = globalContext.get('google').youtube({ version: 'v3' });
		const playlistId = await userTaskService.createPlaylist(youtube, { videoIds: ids, title, description, defaultLanguage, isPublic });
		res.json({ message: `Tạo danh sách phát thành công danh sách phát thành công.`, data: playlistId });
	} catch (error) {
		if (error instanceof createError.HttpError) throw error;
		next(createError(500, { message: `Không thể tạo danh sách phát ngay bây giờ, thử lại sau.` }));
	}
};

module.exports = { playlistLength, createPlaylist };
