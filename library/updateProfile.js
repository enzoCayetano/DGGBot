const Profile = require('../models/Profile');

/**
 * Updates the user's profile title ID based on their roles.
 * @param {Object} member - Discord guild member object.
 * @param {Object} roleTitleMap - Mapping of role IDs to title IDs.
 * @returns {Promise<Object|null>} The updated profile or null if not found.
 * @throws Will throw an error if the update fails.
 */
async function updateProfile(member, roleTitleMap = {})
{
  try
  {
    // Fetch user profile by ID
    const profile = await Profile.findOne({ userId: member.id });
    if (!profile)
      return null;

    // Filter member roles to those present in the roleTitleMap
    const validRoles = member.roles.cache
      .filter(role => Object.prototype.hasOwnProperty.call(roleTitleMap, role.id))
      .map(role => ({
        id: role.id,
        position: role.position
      }));

    // If user has roles matching the map, pick highest position role as title
    if (validRoles.length > 0)
    {
      validRoles.sort((a, b) => b.position - a.position);
      profile.title = validRoles[0].id;
    }
    else
    {
      // Set default title if no matching roles
      profile.title = "1239311742694199388";
    }

    // Save updated profile
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
