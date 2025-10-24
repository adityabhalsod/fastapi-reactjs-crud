"""
Input sanitization utilities for security.
"""
import re
import html
from typing import Optional


def sanitize_html(text: str) -> str:
    """
    Escape HTML special characters to prevent XSS attacks.
    
    Args:
        text: Input string that may contain HTML
        
    Returns:
        Sanitized string with HTML entities escaped
    """
    if not text:
        return text
    
    return html.escape(text, quote=True)


def sanitize_sql(text: str) -> str:
    """
    Basic SQL injection prevention (SQLAlchemy ORM handles this better).
    This is mainly for logging and display purposes.
    
    Args:
        text: Input string
        
    Returns:
        Sanitized string
    """
    if not text:
        return text
    
    # Remove SQL keywords (basic protection, ORM is better)
    dangerous_patterns = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)",
        r"(--|;|\/\*|\*\/)",
    ]
    
    result = text
    for pattern in dangerous_patterns:
        result = re.sub(pattern, "", result, flags=re.IGNORECASE)
    
    return result.strip()


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal attacks.
    
    Args:
        filename: Original filename
        
    Returns:
        Safe filename
    """
    if not filename:
        return filename
    
    # Remove path separators and special characters
    filename = re.sub(r'[/\\]', '', filename)
    filename = re.sub(r'\.\.', '', filename)
    filename = re.sub(r'[<>:"|?*]', '', filename)
    
    return filename.strip()


def validate_email(email: str) -> bool:
    """
    Validate email format.
    
    Args:
        email: Email address to validate
        
    Returns:
        True if valid email format
    """
    if not email:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_username(username: str) -> bool:
    """
    Validate username format (alphanumeric, underscore, hyphen).
    
    Args:
        username: Username to validate
        
    Returns:
        True if valid username format
    """
    if not username:
        return False
    
    pattern = r'^[a-zA-Z0-9_-]{3,50}$'
    return bool(re.match(pattern, username))


def sanitize_search_query(query: str, max_length: int = 100) -> str:
    """
    Sanitize search query input.
    
    Args:
        query: Search query string
        max_length: Maximum allowed length
        
    Returns:
        Sanitized search query
    """
    if not query:
        return ""
    
    # Trim to max length
    query = query[:max_length]
    
    # Remove special characters that might be used for injection
    query = re.sub(r'[<>\'";\\]', '', query)
    
    return query.strip()


def sanitize_input(text: str, allow_html: bool = False) -> str:
    """
    General purpose input sanitization.
    
    Args:
        text: Input text to sanitize
        allow_html: Whether to allow HTML (if False, escapes HTML)
        
    Returns:
        Sanitized text
    """
    if not text:
        return text
    
    if not allow_html:
        text = sanitize_html(text)
    
    # Remove null bytes
    text = text.replace('\x00', '')
    
    return text.strip()
