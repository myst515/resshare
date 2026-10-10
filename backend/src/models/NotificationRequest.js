class NotificationRequest 
{
  constructor(id, userId, facilityId,message, channel, status, createdAt) 
  {
    this.id = id;
    this.userId = userId;
    this.facilityId = facilityId;
    this.message = message;
    this.channel = channel;
    this.status = status;
    this.createdAt = createdAt;
  }
  
   // Cancels the notification request.
   
  cancel() 
  {
    this.status = 'CANCELLED';
  }

  // Marks the notification request as sent.
  markSent() 
  {
    this.status = 'SENT';
  }
}

module.exports = NotificationRequest;