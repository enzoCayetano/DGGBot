const Profile = require('../models/Profile');

/**
 * Creates a user profile if it doesn't exist.
 * @param {*} user 
 * @param {*} options 
 * @returns 
 */
async function createProfile(user, options = {})
{
  try
  {
    const existingProfile = await Profile.findOne({ userId: user.id });
    if (existingProfile) return existingProfile;

    const defaults = {
      title: 'Member',
      xp: 0,
      level: 1,
      reputation: 0,
      bio: 'No bio set.',
      points: 0,
      lastClaimed: new Date(),
      joinedAt: new Date()
    };

    const newProfile = new Profile({
      username: user.username,
      userId: user.id,
      ...defaults,
      ...options
    });

    await newProfile.save();
    return newProfile;
  }
  catch (err)
  {
    console.error('Error creating profile:', err);
    throw new Error(`Failed to create profile: ${err.message}`);
  }
}

module.exports = createProfile;