import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="
      bg-gradient-to-br from-slate-800 to-slate-900
      rounded-xl border border-slate-700
      p-6
    ">
      <h2 className="text-2xl font-bold mb-6">Terms & Condition</h2>
      
      <ol className="list-decimal list-inside space-y-3 pl-2 text-slate-300">
        <li className="pl-2">
          If the product is sold out, it is still available for purchase. However the availability is subject to stock levels.
        </li>
        <li className="pl-2">
          After purchased, you may activate any time.
        </li>
        <li className="pl-2">
          Stock updates will be reflected in the system accordingly.
        </li>
        <li className="pl-2">
          If an item is out of stock at the time of purchase, you can still purchase and wait for becomes available.
        </li>
        <li className="pl-2">
          Purchase Contracts:
          <ol className="list-[lower-alpha] list-inside pl-6 mt-2 space-y-2">
            <li>
              Single Contract: This allows you to buy the product immediately as an individual purchase.
            </li>
            <li>
              Shared Contract: This option allows for group buying. One unit equals ten shares. Ownership is shared among participants in the group buy.
            </li>
          </ol>
        </li>
      </ol>
    </div>
  );
};

export default TermsAndConditions;