const _ = require('lodash');
const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');
dayjs.extend(duration);

const playlistItems = async (youtube, playlistId) => {
	const result = [];
	let nextPageToken = '';
	do {
		// prettier-ignore
		const res = await youtube.playlistItems.list({ part: ['snippet', 'id', 'contentDetails', 'status'], playlistId: playlistId, maxResults: 50, pageToken: nextPageToken });
		// prettier-ignore
		result.push(..._.map(res.data.items, (item) =>  _.pick(	{ ...item.snippet, ...item.contentDetails, ...item.status,	},	[ "publishedAt", "title", "description", "channelId", "thumbnails", "channelTitle", "playlistId", "position", "videoId", "privacyStatus"])));
		nextPageToken = res.data?.nextPageToken;
	} while (nextPageToken);
	return result;
};

const items = async (youtube, videoIds) => {
	const result = [];
	for (const chunk of _.chunk(videoIds, 50)) {
		// prettier-ignore
		const res = await youtube.videos.list({ part: ["contentDetails", "id", "liveStreamingDetails", "localizations", "paidProductPlacementDetails", "player", "recordingDetails", "snippet", "statistics", "status", "topicDetails"], id: chunk, maxResults: 50 });
		// prettier-ignore
		result.push(..._.map(res.data.items, (item) => _.pick({ ...item.snippet, ...item.contentDetails, ...item.status, ...item.statistics, ...item.player,},[ "publishedAt", "title", "description", "channelId", "thumbnails", "channelTitle", "tags", "defaultAudioLanguage", "playlistId", "position", "videoId", "duration", "dimension", "definition", "caption", "licensedContent", "privacyStatus", "embeddable", "madeForKids", "viewCount", "likeCount", "commentCount", "embedHtml"])));
	}
	return result;
};

const playlistLength = async (youtube, { playlistId, end, removeDuplicated = true, sort = true, start = 0 }) => {
	let item = await playlistItems(youtube, playlistId);
	let publicItemIds = item.filter((v) => v.privacyStatus == 'public').map((url) => url.videoId);
	const privateItemIds = item.filter((v) => v.privacyStatus != 'public').map((url) => url.videoId);
	if (removeDuplicated) publicItemIds = _.uniq(publicItemIds.slice(start, end));
	let publicItems = await items(youtube, publicItemIds);
	if (sort) publicItems = _.sortBy(publicItems, ['publishedAt']);
	const duration = publicItems.reduce((a, v) => a.add(dayjs.duration(v.duration)), dayjs.duration(0));
	const ids = { publicItemIds, privateItemIds };
	return [duration, ids];
};

module.exports = { playlistItems, items, playlistLength };
