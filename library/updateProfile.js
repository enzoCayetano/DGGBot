const Profile = require('../models/Profile');

/**
 * Updates the user's profile title id based on their roles.
 * @param {*} member 
 * @param {*} roleTitleMap 
 * @returns 
 */
async function updateProfile(member, roleTitleMap = {})
{
  try
  {
    const profile = await Profile.findOne({ userId: member.id });
    if (!profile) return null;

    const validRoles = member.roles.cache
      .filter(role => roleTitleMap.hasOwnProperty(role.id))
      .map(role => ({
        id: role.id,
        position: role.position
      }))

    if (validRoles.length > 0)
    {
      validRoles.sort((a, b) => b.position - a.position);
      profile.title = validRoles[0].id;
    }
    else
    {
      profile.title = "1239311742694199388";
    }
  
    await profile.save();
    return profile;
  }
  catch (err)
  {
    console.error('Error updating profile title:', err);
    throw new Error(`Failed to update profile title: ${err.message}`);
  }
}

module.exports = updateProfile;