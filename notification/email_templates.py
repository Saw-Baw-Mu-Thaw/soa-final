def homework_created_template(student_name: str, title: str, deadline: str):
    return f"""
Hello {student_name},

 A new homework has been assigned!

 Title: {title}
Deadline: {deadline}

Please log in to the LMS to view details and submit on time.

Best regards,
Your Instructor
"""

def homework_updated_template(student_name: str, title: str, deadline: str):
    return f"""
Hello {student_name},

 The homework has been updated!

Title: {title}
 Updated Deadline: {deadline}

Please check the LMS for the latest changes.

Best regards,
Your Instructor
"""