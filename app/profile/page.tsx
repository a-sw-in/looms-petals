"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const { user, updateProfile, deleteAccount, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user && !isEditingProfile) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setAge(user.age || "");
      setGender(user.gender || "");
    }
  }, [user, isEditingProfile]);

  const handleCancel = () => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setAge(user.age || "");
      setGender(user.gender || "");
    }
    setIsEditingProfile(false);
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSaving(true);

    try {
      const result = await updateProfile({
        name,
        phone,
        address,
        age: age === "" ? null : Number(age),
        gender
      });
      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditingProfile(false);
      } else {
        setMessage({ type: "error", text: result.message || "Update failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await deleteAccount();
      if (!result.success) {
        setMessage({ type: "error", text: result.message || "Failed to delete account" });
        setShowDeleteModal(false);
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred during account deletion" });
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          ← Back
        </button>

        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>My Profile</h1>
            <p className={styles.subtitle}>Manage your account information</p>
          </div>

          {!isEditingProfile ? (
            <div className={styles.viewMode}>
              {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                  {message.text}
                </div>
              )}

              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoValue}>{user.email}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Name</span>
                  <span className={styles.infoValue}>{user.name || "Not provided"}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Phone</span>
                  <span className={styles.infoValue}>{user.phone || "Not provided"}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Age</span>
                  <span className={styles.infoValue}>{user.age || "Not provided"}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Gender</span>
                  <span className={styles.infoValue}>{user.gender || "Not provided"}</span>
                </div>
                <div className={`${styles.infoItem} ${styles.fullWidth}`}>
                  <span className={styles.infoLabel}>Address</span>
                  <span className={styles.infoValue}>{user.address || "Not provided"}</span>
                </div>
              </div>

              <button
                onClick={() => setIsEditingProfile(true)}
                className={styles.editBtn}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                  {message.text}
                </div>
              )}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user.email}
                    className={styles.input}
                    disabled
                  />
                  <p className={styles.hint}>Email cannot be changed</p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                    placeholder="Enter your name"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.label}>
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={styles.input}
                    placeholder="Enter your phone number"
                    disabled={saving}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="age" className={styles.label}>
                    Age
                  </label>
                  <input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                    className={styles.input}
                    placeholder="Enter your age"
                    disabled={saving}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="gender" className={styles.label}>
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={styles.input}
                    disabled={saving}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address" className={styles.label}>
                  Address
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={styles.input}
                  placeholder="Enter your address"
                  rows={3}
                  disabled={saving}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={handleCancel}
                  className={styles.cancelBtn}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          <div className={styles.dangerZone}>
            <h3 className={styles.dangerTitle}>Danger Zone</h3>
            <p className={styles.dangerText}>Once you delete your account, there is no going back. Please be certain.</p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className={styles.deleteBtn}
              disabled={saving || isDeleting}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Delete Account?</h2>
            <p className={styles.modalText}>
              Are you sure you want to delete your account? This action is permanent and cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={styles.cancelBtn}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className={styles.confirmDeleteBtn}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
