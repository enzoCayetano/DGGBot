const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('canvasdemo')
    .setDescription('Generates a simple canvas image with text.'),

  async execute(interaction) 
  {
    const canvas = createCanvas(800, 300);
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 0);
    gradient.addColorStop(0, '#4e54c8');
    gradient.addColorStop(1, '#8f94fb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px "Open Sans", sans-serif';
    ctx.fillText('Canvas Demo', 40, 60);

    // Rounded Rectangle
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    drawRoundedRect(ctx, 30, 90, 740, 180, 20);
    ctx.fill();

    // User Info Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px "Open Sans", sans-serif';
    ctx.fillText(`Username: ${interaction.user.username}`, 260, 140);
    ctx.fillText(`User ID: ${interaction.user.id}`, 260, 180);
    ctx.fillText(`Time: ${new Date().toLocaleString()}`, 260, 220);

    // Avatar
    const avatarURL = interaction.user.displayAvatarURL({ extension: 'png', size: 128, forceStatic: true });
    const avatar = await loadImage(avatarURL);

    // Draw circular avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(140, 180, 64, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 76, 116, 128, 128);
    ctx.restore();

    // Send the image
    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'canvas-demo.png' });
    await interaction.reply({ files: [attachment] });
  }
};

// Helper: Draw Rounded Rect
function drawRoundedRect(ctx, x, y, width, height, radius) 
{
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}