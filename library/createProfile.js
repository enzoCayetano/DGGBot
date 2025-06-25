const Profile = require('../models/Profile');

/**
 * Creates a user profile if it doesn't exist.
 * @param {Object} user - The Discord user object.
 * @param {Object} member - The Discord guild member object.
 * @param {Object} [options={}] - Optional overrides for profile fields.
 * @returns {Promise<Object>} The existing or newly created profile document.
 * @throws Will throw an error if profile creation fails.
 */
async function createProfile(user, member, options = {})
{
  try
  {
    // Check if profile already exists
    const existingProfile = await Profile.findOne({ userId: user.id });
    if (existingProfile)
      return existingProfile;

    // Default profile fields
    const defaults =
    {
      title: '1239311742694199388',
      xp: 0,
      level: 1,
      reputation: 0,
      repGivenToday: [],
      lastRepTarget: null,
      lastRepDate: null,
      bio: 'No bio set.',
      points: 0,
      bankBalance: 0,
      bankLevel: 1,
      tournamentsWon: 0,
      dailyStreak: 0,
      lastClaimed: null,
      joinedAt: member ? member.joinedAt : new Date(),
    };

    // Create new profile with defaults and optional overrides
    const newProfile = new Profile(
    {
      username: user.username,
      userId: user.id,
      ...defaults,
      ...options
    });

    // Save and return new profile
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
