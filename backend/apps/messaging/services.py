from django.db import transaction
from .models import SmsLog


class SmsService:
    @staticmethod
    @transaction.atomic
    def queue_campaign(campaign, user=None):
        logs = [
            SmsLog(
                organization=campaign.organization,
                campaign=campaign,
                recipient_phone=recipient.phone,
                message=campaign.message,
                status="queued",
                created_by=user,
                updated_by=user,
            )
            for recipient in campaign.recipients.all()
        ]
        SmsLog.objects.bulk_create(logs)
        campaign.status = "queued"
        campaign.save(update_fields=["status", "updated_at"])
        return len(logs)

