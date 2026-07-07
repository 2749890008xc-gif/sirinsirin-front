
import moment from 'moment';

const getLocalImage = (image) => {
    return new URL(`../assets/${image}`, import.meta.url).href;
}

const formatDate = (timestamp) => {
    const timestampTime = moment(timestamp);    //  文件的创建时间
    //  当前时间 - 创建时间 = 文件的存在时长
    const days = Number.parseInt(moment().format('YYYYMMDD')) - Number.parseInt(timestampTime.format('YYYYMMDD'));

    if(days == 0){
        return timestampTime.format('HH:mm') + '前';
    }else if(days == 1){
        return "昨天";
    }else if(days >= 2 && days < 7){
        const weekCn = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', ]
        const weekNum = moment(timestampTime).weekday();    //  大于2天，小于7天，显示“星期*”
        return weekCn[weekNum];
    }else if(days >= 7){
        return timestampTime.format("YYYY-MM-DD");
    }
}

const convertSecondsToHMS = (seconds) => {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainingSeconds = seconds % 60;
    return (hours == 0 ? "" : hours.toString().padStart(2, '0') + ":") +
        minutes.toString().padStart(2, '0') + ":" +
        remainingSeconds.toString().padStart(2, '0');
};

export default {
    getLocalImage,
    formatDate,
    convertSecondsToHMS,
}