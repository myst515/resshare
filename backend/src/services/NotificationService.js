const NotificationRequest = require('../models/NotificationRequest');

class NotificationService 
{
  constructor() 
  {
    this.requests = [];
    this.nextId = 1;
  }
// Creates and stores a new notification request for a facility.
  requestNotification(userId, facilityId, channel) 
  {
    const request =new NotificationRequest
    (
      this.nextId++,
      userId,
      facilityId,
      `Facility ${facilityId} is available`,
      channel,
      'PENDING',
      new Date()
    );

    this.requests.push(request);

    return request;
  }
  // Sends notifications to residents with pending notification requests.
  notifyFacilityAvailable(facilityId) 
  {
    const pendingRequests = this.requests.filter
    (
      request=>
        request.status === 'PENDING' &&
             request.facilityId === facilityId
    );

    pendingRequests.forEach(request => 
    {
      const message = `Facility ${facilityId} is now available`;

      if(request.channel === 'EMAIL') 
      {
        this.sendEmail(request.userId, message);
      } else if (request.channel === 'IN_APP') 
    {
        this.sendInApp(request.userId, message);
      }

      request.markSent();
    });
  }

  // Cancels a notification request using its ID.
  cancelRequest(requestId) 
  {
    const request = this.requests.find
    (
      request => request.id === requestId
    );

    if (!request) 
    {
      throw new Error('Notification request not found');
    }

    request.cancel();
  }
  // Sends a notification through email.
  sendEmail(to, message) 
  {
    console.log(`Email notification to ${to}: ${message}`);
  }

  // Sends a notification inside the application.
  sendInApp(userId, message) 
  {
    console.log(`In-app notification to user ${userId}: ${message}`);
  }
}

module.exports = new NotificationService();