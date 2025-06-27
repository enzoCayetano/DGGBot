const { createCanvas, loadImage, registerFont } = require('canvas');
const roleTitles = require('../../json/roles.json')
const path = require('path');

// import font
registerFont(path.join(__dirname, '../../assets/fonts/poppin/Poppins-Regular.ttf'), {
    family: 'Poppins Regular'
});

module.exports = async function renderProfileCard(profile, member)
{
    // Canvas settings
    const width = 700;
    const height = 300;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#232526');
    bgGradient.addColorStop(1, '#414345');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Avatar settings
    const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 128 }));
    const avatarSize = 100;
    const avatarX = 30;
    const avatarY = 30;

    // Avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Name & Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px "Poppins"';
    ctx.fillText(`${member.displayName} (${profile.username})`, 150, 60);
    ctx.font = '20px "Poppins"';
    ctx.fillStyle = '#aaaaaa'
    ctx.fillText(`${roleTitles[profile.title]?.title}`, 150, 90);

    // XP Bar
    const xp = profile.xp;
    const xpTotal = profile.xp + profile.xpToNextLevel;
    const xpPercent = profile.xpToNextLevel > 0 ? profile.xp / (profile.xp + profile.xpToNextLevel) : 1;
    const xpBarWidth = 500;
    const xpBarHeight = 20;
    const xpBarX = 150;
    const xpBarY = 100;

    ctx.fillStyle = '#333';
    ctx.fillRect(xpBarX, xpBarY, xpBarWidth, xpBarHeight);

    ctx.fillStyle = '#00ff88';
    ctx.fillRect(xpBarX, xpBarY, xpBarWidth * xpPercent, xpBarHeight);

    // XP Text
    ctx.font = '16px "Poppins"';
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`XP: ${xp} / ${xpTotal}`, xpBarX + xpBarWidth / 2, xpBarY + xpBarHeight / 2);
    ctx.textAlign = 'start'; // reset alignment

    // Reputation bar config
    const repBarX = 150;
    const repBarY = 270;
    const repBarWidth = 500;
    const repBarHeight = 10;
    const rep = Math.max(-255, Math.min(255, profile.reputation));
    const repPercent = (rep + 255) / 510;
    const dotX = repBarX + repPercent * repBarWidth;
    const dotY = repBarY + repBarHeight / 2;

    // Rep bar color gradient
    const repGradient = ctx.createLinearGradient(repBarX, 0, repBarX + repBarWidth, 0);
    repGradient.addColorStop(0, '#ff0f0f');
    repGradient.addColorStop(0.4, '#444444');
    repGradient.addColorStop(0.6, '#555555');
    repGradient.addColorStop(1, '#ffffff');

    // Glow effect under the bar
    ctx.save();
    ctx.shadowColor = '#999999';
    ctx.shadowBlur = 10;
    ctx.lineJoin = 'round';
    ctx.fillStyle = repGradient;

    // Rounded bar path
    ctx.beginPath();
    ctx.moveTo(repBarX + repBarHeight / 2, repBarY);
    ctx.lineTo(repBarX + repBarWidth - repBarHeight / 2, repBarY);
    ctx.quadraticCurveTo(repBarX + repBarWidth, repBarY, repBarX + repBarWidth, repBarY + repBarHeight / 2);
    ctx.quadraticCurveTo(repBarX + repBarWidth, repBarY + repBarHeight, repBarX + repBarWidth - repBarHeight / 2, repBarY + repBarHeight);
    ctx.lineTo(repBarX + repBarHeight / 2, repBarY + repBarHeight);
    ctx.quadraticCurveTo(repBarX, repBarY + repBarHeight, repBarX, repBarY + repBarHeight / 2);
    ctx.quadraticCurveTo(repBarX, repBarY, repBarX + repBarHeight / 2, repBarY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Rep icon placement
    let iconPath;
    if (rep < -80)
    {
        iconPath = path.join(__dirname, '../../assets/icons/hellokitty_devil_icon.png');
    }
    else if (rep > 80)
    {
        iconPath = path.join(__dirname, '../../assets/icons/hellokitty_angel_icon.png');
    }
    else
    {
        iconPath = path.join(__dirname, '../../assets/icons/hellokitty_normal_icon.png');
    }

    // Draw icon
    try
    {
        const dotImg = await loadImage(iconPath);
        ctx.drawImage(dotImg, dotX - 16, dotY - 16, 32, 32);
    }
    catch (err)
    {
        console.error('Failed to load rep icon:', iconPath, err);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    // Stats
    const stats = [
        ['Level', profile.level],
        ['Riokens' ,profile.points],
        ['Tournaments Won', profile.tournamentsWon],
        ['Joined', new Date(profile.joinedAt).toLocaleDateString()],
        ['Last Daily', profile.lastClaimed ? profile.lastClaimed.toLocaleDateString() : 'Never']
    ];

    ctx.font = '18px "Poppins"';
    ctx.fillStyle = '#ffffff'

    const col1X = 150;
    const col2X = 400;
    const statsY = 140;

    stats.forEach((stat, i) => {
        const x = i < 5 ? col1X : col2X;
        const y = statsY + (i % 5) * 24;
        ctx.fillText(`${stat[0]}: ${stat[1]}`, x, y);
    });

    return canvas.toBuffer();
};