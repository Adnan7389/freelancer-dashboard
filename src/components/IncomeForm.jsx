import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

// Validation schema
const incomeSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount is required" })
    .positive("Amount must be greater than 0"),
  platform: z.string(),
  date: z
    .string()
    .refine((date) => new Date(date) <= new Date(), {
      message: "Date cannot be in the future",
    }),
  description: z.string().optional(),
});

function IncomeForm() {
  const { currentUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      platform: "Fiverr",
    },
  });

  const onSubmit = async (data) => {
    try {
      await addDoc(collection(db, "incomes"), {
        userId: currentUser.uid,
        amount: data.amount,
        platform: data.platform,
        date: data.date,
        description: data.description,
        createdAt: serverTimestamp(),
      });

      toast.success("Income added!");
      reset();
    } catch (err) {
      toast.error("Failed to add income: " + err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Toaster position="top-center" />
      <h3 className="text-lg font-bold mb-4">Add Income</h3>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Amount */}
        <div className="mb-4">
          <label className="block text-gray-700">Amount ($)</label>
          <input
            type="number"
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
            className="w-full p-2 border rounded"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm">{errors.amount.message}</p>
          )}
        </div>

        {/* Platform */}
        <div className="mb-4">
          <label className="block text-gray-700">Platform</label>
          <select {...register("platform")} className="w-full p-2 border rounded">
            <option value="Fiverr">Fiverr</option>
            <option value="Upwork">Upwork</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="block text-gray-700">Date</label>
          <input
            type="date"
            {...register("date")}
            className="w-full p-2 border rounded"
          />
          {errors.date && (
            <p className="text-red-500 text-sm">{errors.date.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-gray-700">Description (Optional)</label>
          <textarea
            {...register("description")}
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-white p-2 rounded ${
            isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Adding..." : "Add Income"}
        </button>
      </form>
    </div>
  );
}

export default IncomeForm;
