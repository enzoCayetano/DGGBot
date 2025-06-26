const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

// use optional font here later

module.exports = async function renderProfileCard(profile, member)
{
    const width = 800;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#2c2f33'
    ctx.fillRect(0, 0, width, height);

    // Avatar
    const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 128 }));
    ctx.drawImage(avatar, 30, 30, 100, 100);

    // Name & Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px sans-serif';
    ctx.fillText(`${member.displayName}`, 150, 60);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#aaaaaa'
    ctx.fillText(`Title: ${profile.title}`, 150, 90);

    // XP Bar
    const xpPercent = profile.xpToNextLevel > 0 ? profile.xp / (profile.xp + profile.xpToNextLevel) : 1;
    const barWidth = 500;
    const barHeight = 20;
    const barX = 150;
    const barY = 120;

    ctx.fillStyle = '#555';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = '#13ed5f';
    ctx.fillRect(barX, barY, barWidth * xpPercent, barHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.fillText(`XP: ${profile.xp} / ${profile.xp + profile.xpToNextLevel}`, barX, barY - 10);

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

    // // Stats
    // const stats = [
    //     `Level: ${profile.level}`,
    //     `Riokens: ${profile.points}`,
    //     `Tournaments Won: ${profile.tournamentsWon}`,
    //     `Joined: ${new Date(profile.joinedAt).toLocaleDateString()}`,
    //     `Last Daily: ${profile.lastClaimed ? profile.lastClaimed.toLocaleDateString() : 'Never'}`
    // ];

    // ctx.font = '18px sans-serif';
    // ctx.fillStyle = '#ffffff'

    // stats.forEach((line, i) => {
    //     ctx.fillText(line, 150, 170 + i * 25);
    // });

    return canvas.toBuffer();
};