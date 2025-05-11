from django.db import models

class ROOT(models.Model):
    id = models.AutoField(primary_key=True)

    name = models.CharField(max_length=255)
    json_map = models.JSONField()

    def __str__(self):
        return self.name