"""
API endpoint testing script.
Run with: python test_api.py
"""
import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = f"test_{datetime.now().timestamp()}@example.com"
TEST_USERNAME = f"testuser_{int(datetime.now().timestamp())}"
TEST_PASSWORD = "Test@1234"

# Test results storage
results = {
    "passed": [],
    "failed": [],
}


def log_result(test_name: str, passed: bool, message: str = ""):
    """Log test result."""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {test_name}")
    if message:
        print(f"   └─ {message}")
    
    if passed:
        results["passed"].append(test_name)
    else:
        results["failed"].append(test_name)


def test_health_check():
    """Test health check endpoint."""
    try:
        response = requests.get(f"{BASE_URL}/health")
        passed = response.status_code == 200 and response.json().get("status") == "healthy"
        log_result("Health Check", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_result("Health Check", False, str(e))
        return False


def test_signup(email: str, username: str, password: str):
    """Test user signup."""
    try:
        data = {
            "email": email,
            "username": username,
            "full_name": "Test User",
            "password": password
        }
        response = requests.post(f"{BASE_URL}/api/auth/signup", json=data)
        passed = response.status_code == 201
        log_result("User Signup", passed, f"Status: {response.status_code}")
        return response.json() if passed else None
    except Exception as e:
        log_result("User Signup", False, str(e))
        return None


def test_login(username: str, password: str):
    """Test user login."""
    try:
        data = {
            "username": username,
            "password": password
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
        passed = response.status_code == 200 and "access_token" in response.json()
        log_result("User Login", passed, f"Status: {response.status_code}")
        return response.json().get("access_token") if passed else None
    except Exception as e:
        log_result("User Login", False, str(e))
        return None


def test_get_current_user(token: str):
    """Test getting current user info."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        passed = response.status_code == 200
        log_result("Get Current User", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_result("Get Current User", False, str(e))
        return False


def test_forgot_password(email: str):
    """Test forgot password endpoint."""
    try:
        data = {"email": email}
        response = requests.post(f"{BASE_URL}/api/auth/forgot-password", json=data)
        passed = response.status_code == 200
        log_result("Forgot Password", passed, f"Status: {response.status_code}")
        return response.json().get("reset_token") if passed else None
    except Exception as e:
        log_result("Forgot Password", False, str(e))
        return None


def test_reset_password(token: str, new_password: str):
    """Test reset password endpoint."""
    try:
        data = {
            "token": token,
            "new_password": new_password
        }
        response = requests.post(f"{BASE_URL}/api/auth/reset-password", json=data)
        passed = response.status_code == 200
        log_result("Reset Password", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_result("Reset Password", False, str(e))
        return False


def test_create_item(token: str):
    """Test creating an item."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        data = {
            "name": "Test Item",
            "description": "A test item",
            "price": 99.99,
            "category": "Electronics"
        }
        response = requests.post(f"{BASE_URL}/api/items", json=data, headers=headers)
        passed = response.status_code == 201
        log_result("Create Item", passed, f"Status: {response.status_code}")
        return response.json().get("id") if passed else None
    except Exception as e:
        log_result("Create Item", False, str(e))
        return None


def test_get_items(token: str):
    """Test getting items list."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/items", headers=headers)
        passed = response.status_code == 200
        log_result("Get Items List", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_result("Get Items List", False, str(e))
        return False


def test_get_items_with_filters(token: str):
    """Test getting items with filters."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        params = {
            "skip": 0,
            "limit": 10,
            "search": "Test",
            "category": "Electronics"
        }
        response = requests.get(f"{BASE_URL}/api/items", headers=headers, params=params)
        passed = response.status_code == 200
        log_result("Get Items with Filters", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_result("Get Items with Filters", False, str(e))
        return False


def test_get_item_by_id(token: str, item_id: int):
    """Test getting a specific item."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/items/{item_id}", headers=headers)
        passed = response.status_code == 200
        log_result("Get Item by ID", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_result("Get Item by ID", False, str(e))
        return False


def test_update_item(token: str, item_id: int):
    """Test updating an item."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        data = {
            "name": "Updated Test Item",
            "description": "Updated description",
            "price": 149.99,
            "category": "Electronics"
        }
        response = requests.put(f"{BASE_URL}/api/items/{item_id}", json=data, headers=headers)
        passed = response.status_code == 200
        log_result("Update Item (PUT)", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_result("Update Item (PUT)", False, str(e))
        return False


def test_patch_item(token: str, item_id: int):
    """Test partially updating an item."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        data = {"price": 199.99}
        response = requests.patch(f"{BASE_URL}/api/items/{item_id}", json=data, headers=headers)
        passed = response.status_code == 200
        log_result("Update Item (PATCH)", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_result("Update Item (PATCH)", False, str(e))
        return False


def test_get_item_stats(token: str):
    """Test getting item statistics."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/items/stats", headers=headers)
        passed = response.status_code == 200
        log_result("Get Item Statistics", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_result("Get Item Statistics", False, str(e))
        return False


def test_delete_item(token: str, item_id: int):
    """Test deleting an item."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.delete(f"{BASE_URL}/api/items/{item_id}", headers=headers)
        passed = response.status_code == 204
        log_result("Delete Item", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_result("Delete Item", False, str(e))
        return False


def test_unauthorized_access():
    """Test that endpoints require authentication."""
    try:
        response = requests.get(f"{BASE_URL}/api/items")
        passed = response.status_code == 401
        log_result("Unauthorized Access Protection", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_result("Unauthorized Access Protection", False, str(e))
        return False


def run_all_tests():
    """Run all API tests."""
    print("\n" + "="*60)
    print("🚀 Starting API Endpoint Tests")
    print("="*60 + "\n")
    
    # Test 1: Health check
    print("📋 Testing Health Endpoints...")
    test_health_check()
    
    # Test 2: Authentication flow
    print("\n🔐 Testing Authentication Endpoints...")
    user = test_signup(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD)
    if not user:
        print("❌ Cannot continue without successful signup")
        return
    
    token = test_login(TEST_USERNAME, TEST_PASSWORD)
    if not token:
        print("❌ Cannot continue without successful login")
        return
    
    test_get_current_user(token)
    
    # Test 3: Password reset flow
    print("\n🔑 Testing Password Reset Endpoints...")
    reset_token = test_forgot_password(TEST_EMAIL)
    if reset_token:
        test_reset_password(reset_token, "NewTest@1234")
    
    # Test 4: Items CRUD
    print("\n📦 Testing Items CRUD Endpoints...")
    item_id = test_create_item(token)
    test_get_items(token)
    test_get_items_with_filters(token)
    test_get_item_stats(token)
    
    if item_id:
        test_get_item_by_id(token, item_id)
        test_update_item(token, item_id)
        test_patch_item(token, item_id)
        test_delete_item(token, item_id)
    
    # Test 5: Security
    print("\n🔒 Testing Security...")
    test_unauthorized_access()
    
    # Print summary
    print("\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)
    print(f"✅ Passed: {len(results['passed'])}")
    print(f"❌ Failed: {len(results['failed'])}")
    print(f"📈 Success Rate: {len(results['passed']) / (len(results['passed']) + len(results['failed'])) * 100:.1f}%")
    
    if results["failed"]:
        print("\nFailed tests:")
        for test in results["failed"]:
            print(f"  - {test}")
    
    print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Fatal error: {e}")
