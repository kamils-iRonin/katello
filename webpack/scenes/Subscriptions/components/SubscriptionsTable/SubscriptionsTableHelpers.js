const getMaxQuantity = (subscription, upstreamAvailable) => {
  if (upstreamAvailable === -1) {
    return upstreamAvailable;
  }
  return upstreamAvailable + subscription.quantity;
};

const buildTableRow = (subscription, availableQuantities, updatedQuantity) => {
  const upstreamAvailableLoaded = !!availableQuantities;
  const upstreamAvailable = upstreamAvailableLoaded
    ? availableQuantities[subscription.id]
    : null;

  let maxQuantity;
  if (upstreamAvailableLoaded) {
    maxQuantity = getMaxQuantity(subscription, upstreamAvailable);
  }

  const baseSubscription = {
    ...subscription,
    upstreamAvailable,
    upstreamAvailableLoaded,
    maxQuantity,
  };

  if (updatedQuantity[subscription.id]) {
    return {
      ...baseSubscription,
      entitlementsChanged: true,
      quantity: updatedQuantity[subscription.id],
    };
  }
  return baseSubscription;
};

const buildTableRowsFromGroup = (subscriptionGroup, availableQuantities, updatedQuantity) => {
  const { open, subscriptions } = subscriptionGroup;

  // build row for each subscription
  if (open) {
    return subscriptions.map(subscription =>
      buildTableRow(subscription, availableQuantities, updatedQuantity));
  }

  // build row only for the first subscription in the group
  const [firstSubscription] = subscriptions;
  return [buildTableRow(firstSubscription, availableQuantities, updatedQuantity)];
};

export const buildTableRows = (groupedSubscriptions, availableQuantities, updatedQuantity) => {
  const rows = [];
  Object.values(groupedSubscriptions).forEach(subscriptionGroup =>
    rows.push(...buildTableRowsFromGroup(subscriptionGroup, availableQuantities, updatedQuantity)));

  return rows;
};

export const groupSubscriptionsByProductId = ({ results: subscriptions }) => {
  const grouped = {};

  subscriptions.forEach((subscription) => {
    if (grouped[subscription.product_id] === undefined) {
      grouped[subscription.product_id] = {
        open: false,
        subscriptions: [],
      };
    }

    grouped[subscription.product_id].subscriptions.unshift(subscription);
  });

  return grouped;
};

export const buildPools = updatedQuantity =>
  Object.entries(updatedQuantity).map(([id, quantity]) => ({
    id,
    quantity,
  }));
