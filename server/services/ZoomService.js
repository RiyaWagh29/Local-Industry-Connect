import axios from 'axios';

/**
 * Creates a scheduled Zoom meeting using the Zoom REST API.
 * Needs ZOOM_TOKEN in .env (either a long-lived JWT or a valid OAuth Bearer token).
 * 
 * @param {Object} session - The session document from MongoDB.
 * @param {Object} mentor - The mentor user object (populated).
 * @param {Object} student - The student user object (populated).
 */
export const createZoomMeeting = async (session, mentor, student) => {
  const token = process.env.ZOOM_TOKEN;
  
  if (!token) {
    console.error('[ZoomService] ZOOM_TOKEN is not defined in environment.');
    throw new Error('Zoom configuration error. Contact administrator.');
  }

  // Calculate duration in minutes
  const startTime = new Date(session.start);
  const endTime = new Date(session.end);
  const durationInMinutes = Math.round((endTime - startTime) / (1000 * 60));

  try {
    console.log(`[ZoomService] Creating meeting for Mentor ${mentor.name} and Student ${student.name}`);
    
    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: `Mentor Session - ${mentor.name} with ${student.name}`,
        type: 2, // Scheduled meeting
        start_time: startTime.toISOString(),
        duration: durationInMinutes,
        timezone: 'Asia/Kolkata',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          mute_upon_entry: true,
          waiting_room: false,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.join_url) {
      console.log(`[ZoomService] Meeting created successfully: ${response.data.id}`);
      return response.data.join_url;
    } else {
      throw new Error('Zoom API response did not contain join_url');
    }
  } catch (error) {
    console.error('[ZoomService] Error creating meeting:', error.response?.data || error.message);
    
    // Check for specific Zoom API errors
    if (error.response?.data?.message) {
      throw new Error(`Zoom API Error: ${error.response.data.message}`);
    }
    
    throw new Error('Failed to generate Zoom meeting link. Please try again.');
  }
};
