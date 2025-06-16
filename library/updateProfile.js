const Profile = require('../models/Profile');

/**
 * Updates the user's profile title based on their roles.
 * @param {*} user 
 * @param {*} roleTitleMap 
 * @returns 
 */
async function updateTitle(user, roleTitleMap = {})
{
  try
  {
    const profile = await Profile.findOne({ userId: user.id });
    if (!profile) return null;

    for (const [role, title] of Object.entries(roleTitleMap))
    {
      if (user.roles.cache.has(role))
      {
        profile.title = title;
        await profile.save();
        return profile;
      }
    }
    
    return profile;
  }
  catch (err)
  {
    console.error('Error updating profile title:', err);
    throw new Error(`Failed to update profile title: ${err.message}`);
  }
}