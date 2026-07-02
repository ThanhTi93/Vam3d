import { getSubscriptionPlans, getUserPaymentHistory, getUserSubscriptions } from "@/app/admin/actions";
import ProfilePageClient from "./ProfilePageClient";

interface ProfileContentWrapperProps {
  currentUser: any;
}

export default async function ProfileContentWrapper({ currentUser }: ProfileContentWrapperProps) {
  const [plans, payments, subscriptions] = await Promise.all([
    getSubscriptionPlans(),
    getUserPaymentHistory(currentUser.id),
    getUserSubscriptions(currentUser.id),
  ]);

  return (
    <ProfilePageClient
      currentUser={currentUser}
      initialPlans={plans || []}
      initialPayments={payments || []}
      initialSubscriptions={subscriptions || []}
    />
  );
}
