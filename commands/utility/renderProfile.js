const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

// use optional font here later

module.exports = async function renderProfileCard(profile, member)
{
    const width = 800;
    const height = 300;
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

    // Stats
    const stats = [
        `Level: ${profile.level}`,
        `Reputation: ${profile.reputation}`,
        `Riokens: ${profile.points}`,
        `Tournaments Won: ${profile.tournamentsWon}`,
        `Joined: ${new Date(profile.joinedAt).toLocaleDateString()}`,
        `Last Daily: ${profile.lastClaimed ? profile.lastClaimed.toLocaleDateString() : 'Never'}`
    ];

    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#ffffff'

    stats.forEach((line, i) => {
        ctx.fillText(line, 150, 170 + i * 25);
    });

    return canvas.toBuffer();
};