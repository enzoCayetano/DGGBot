const { createCanvas, loadImage, registerFont } = require('canvas');
const roleTitles = require('../../json/roles.json')
const path = require('path');

// import font
registerFont(path.join(__dirname, '../../assets/fonts/poppin/Poppins-Regular.ttf'), {
    family: 'Poppins Regular'
});

function toRoman(num)
{
    const roman = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    const value = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    let str = '';
    for (let i = 0; i < value.length; i++)
    {
        while (num >= value[i])
        {
            str += roman[i];
            num -= value[i];
        }
    }
    return str;
}

function getLevelColor(level) 
{
  const ones = level % 10;

  if ([8, 9].includes(ones)) return ['#FFD700', '#FF8C00']; // gold to orange
  if ([5, 6, 7].includes(ones)) return ['#00eaff', '#0072ff']; // teal to blue
  if ([3, 4].includes(ones)) return ['#00ff88', '#00cc44']; // green to darker green
  return ['#aaaaaa', '#666666']; // gray tier
}

function getStatusColor(status) 
{
    switch (status) {
        case 'online': return '#43b581';    // green
        case 'idle': return '#faa61a';      // orange
        case 'dnd': return '#f04747';       // red
        case 'offline': default: return '#747f8d'; // gray
    }
}

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

    // Avatar outer border circle based on status
    const status = member.presence?.status || 'offline';
    const statusColor = getStatusColor(status);

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 4, 0, Math.PI * 2);
    ctx.fillStyle = statusColor;
    ctx.fill();
    ctx.closePath();
    ctx.restore();

    // Avatar (clipped)
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

    // Gradient Title
    const title = `${roleTitles[profile.title]?.title || ''}`;
    const titleX = 150;
    const titleY = 90;
    ctx.font = '20px "Poppins"';
    const titleWidth = ctx.measureText(title).width;
    const titleGradient = ctx.createLinearGradient(titleX, 0, titleX + titleWidth, 0);
    titleGradient.addColorStop(0, '#00c3ff');
    titleGradient.addColorStop(1, '#ffff1c');
    ctx.fillStyle = titleGradient;
    ctx.fillText(title, titleX, titleY);

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

    // Roman Number LEVEL
    const level = profile.level;
    const romanLevel = toRoman(level);
    const levelText = `${romanLevel}`;

    const [startColor, endColor] = getLevelColor(level);
    const levelGradient = ctx.createLinearGradient(avatarX, avatarY, avatarX + 40, avatarY);
    levelGradient.addColorStop(0, startColor);
    levelGradient.addColorStop(1, endColor);

    // Level shadow settings for glow effect
    ctx.save();
    ctx.font = '32px "Poppins"';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Stroke (outline)
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'black';
    ctx.strokeText(levelText, avatarX, avatarY);

    // Fill (foreground gradient)
    ctx.fillStyle = levelGradient;
    ctx.fillText(levelText, avatarX, avatarY);
    ctx.restore();

    // Stats
    let statsY = 160;
    ctx.font = '32px "Poppins"';
    ctx.fillText(`💰 ${profile.points}`, 150, statsY);
    ctx.fillText(`🏆 ${profile.tournamentsWon}`, 150, statsY + 48);

    // Reputation bar config
    const repBarWidth = 500;
    const repBarHeight = 10;
    const repBarX = (width - repBarWidth) / 2;
    const repBarY = 250;
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
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 15;
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

    // Footer join date
    ctx.font = '14px "Poppins"';
    ctx.fillStyle = '#aaaaaa';
    ctx.textAlign = 'right';
    ctx.fillText(`Joined: ${new Date(profile.joinedAt).toLocaleDateString()}`, width - 20, height - 20);
    ctx.textAlign = 'start';

    return canvas.toBuffer();
};