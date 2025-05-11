from django.db import models

class ROOT(models.Model):
    id = models.AutoField(primary_key=True)

    name = models.CharField(max_length=255)
    json_map = models.JSONField()
    pdf_file = models.FileField(upload_to='pdfs/', blank=True, null=True)

    def __str__(self):
        return self.name