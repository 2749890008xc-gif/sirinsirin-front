
import moment from 'moment';

const getLocalImage = (image) => {
    image = `../assets/${image}`;
    return new URL(image, import.meta.url).href;
}

const formatDate = (timestamp) => {
    const timestampTime = moment(timestamp);    //  文件的创建时间
    //  当前时间 - 创建时间 = 文件的存在时长
    const days = Number.parseInt(moment().format('YYYYMMDD')) - Number.parseInt(timestampTime.format('YYYYMMDD'));
    if(days == 0){
        return timestampTime.format('HH:mm') + '前';
    }else if(days == 1){
        return "昨天";
    }else if(days >= 2 && days < 7){    //  大于2天，小于7天，显示“星期*”
        const weekCn = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', ]
        const weekNum = moment(timestampTime).weekday();
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

const resetHtmlContent = (data) => {
    if(!data){
        return data;
    }
    data = data.replace(/\r\n/g, '<br>');
    data = data.replace(/\n/g, '<br>');
    return data;
};

const getFileName = (fileName) => {
    if (!fileName) {
        return fileName;
    }
    return fileName.lastIndexOf(".") === -1 ? fileName : fileName.substring(0, fileName.lastIndexOf("."));
}

const size2Str = (limit) => {
    var size = "";
    if (limit < 0.1 * 1024) { // 小于0.1KB，则转化成B
        size = limit.toFixed(2) + "B"
    } else if (limit < 1024 * 1024) { // 小于0.1MB，则转化成KB
        size = (limit / 1024).toFixed(2) + "KB"
    } else if (limit < 1024 * 1024 * 1024) { // 小于1GB，则转化成MB
        size = (limit / (1024 * 1024)).toFixed(2) + "MB"
    } else { // 其他转化成GB
        size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB"
    }

    var sizeStr = size + ""; // 转成字符串
    var index = sizeStr.indexOf("."); // 获取小数点处的索引

    //  注释的代码有一些漏洞，下面为完善后的代码
    // var dou = sizeStr.substring(index + 1, 2)
    // if (dou == "00") {
    //     return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
    // }

    if (index !== -1) {
        const dou = sizeStr.substring(index + 1, index + 3);    // 获取小数点后两位的值
        if (dou === "00") { // 判断后两位是否为00，如果是则删除00
            return sizeStr.substring(0, index) + sizeStr.substring(index + 3);
        }
    }
    return size;
}

/**
 * 根据经验值计算用户等级
 * @param {Number} exp 经验值
 * @returns {Number} 等级
 */
const handleLevel = (exp) => {
    if (exp < 50) {
        return 0;
    } else if (exp < 200) {
        return 1;
    } else if (exp < 1500) {
        return 2;
    } else if (exp < 4500) {
        return 3;
    } else if (exp < 10800) {
        return 4;
    } else if (exp < 28800) {
        return 5;
    } else {
        return 6;
    }
}

/**
 * 邮箱脱敏：中间隐藏过半字符，首尾保留明文
 * @param {string} email 原始邮箱
 * @returns {string} 脱敏邮箱
 */
function maskEmail(email) {
    if (!email || !email.includes('@')) return email;
    const [name, domain] = email.split('@');
    const length = name.length;
    // 需要隐藏的数量（过半）
    const hideNum = Math.ceil(length / 2);

    // 长度过短，没法同时留首尾，直接后半打码
    if (length <= 2) {
        return name.slice(0, length - hideNum) + '*'.repeat(hideNum) + '@' + domain;
    }

    // 首尾各均分剩余可见字符
    const showNum = length - hideNum;
    const leftShow = Math.floor(showNum / 2);
    const rightShow = showNum - leftShow;

    const start = name.slice(0, leftShow);
    const end = name.slice(-rightShow);
    const star = '*'.repeat(hideNum);

    return `${start}${star}${end}@${domain}`;
}

export default {
    getLocalImage,
    formatDate,
    convertSecondsToHMS,
    resetHtmlContent,
    getFileName,
    size2Str,
    handleLevel,
    maskEmail,
}