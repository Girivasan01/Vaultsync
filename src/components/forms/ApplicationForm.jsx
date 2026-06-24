import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../ui/Button.jsx";
import CronExpressionInput from "./CronExpressionInput.jsx";

const schema = z.object({
  appName: z.string().min(1),
  dbHost: z.string().min(1),
  dbPort: z.coerce.number().int().positive(),
  dbUser: z.string().min(1),
  dbPassword: z.string().optional(),
  dbName: z.string().min(1),
  storageLimitGb: z.coerce.number().positive(),
  backupFrequency: z.string().min(9),
  isActive: z.boolean(),
  enterpriseId: z.coerce.number().int().positive(),
});

export default function ApplicationForm({
  initialValues,
  enterprises = [],
  onSubmit,
  onCancel,
}) {
  const isEdit = Boolean(initialValues?.id);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(
      schema.refine((data) => isEdit || data.dbPassword, {
        path: ["dbPassword"],
        message: "Password is required",
      }),
    ),
    defaultValues: {
      appName: initialValues?.appName || "",
      dbHost: initialValues?.dbHost || "",
      dbPort: initialValues?.dbPort || 3306,
      dbUser: initialValues?.dbUser || "",
      dbPassword: "",
      dbName: initialValues?.dbName || "",
      storageLimitGb: initialValues?.storageLimitGb || 5,
      backupFrequency: initialValues?.backupFrequency || "0 2 * * *",
      isActive: initialValues?.isActive ?? true,
      enterpriseId: initialValues?.enterpriseId
        ? String(initialValues.enterpriseId)
        : "",
    },
  });

  const submit = async (values) => {
    const payload = { ...values };
    if (isEdit && !payload.dbPassword) delete payload.dbPassword;
    await onSubmit(payload);
  };

  const fieldClass =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-950";

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          App Name
          <input className={fieldClass} {...register("appName")} />
          {errors.appName ? (
            <span className="text-xs text-coral">{errors.appName.message}</span>
          ) : null}
        </label>
        <label className="space-y-1 text-sm">
          Enterprise
          <select className={fieldClass} {...register("enterpriseId")}>
            <option value="">Select enterprise</option>
            {enterprises.map((e) => (
              <option key={e.id} value={String(e.id)}>
                {e.enterprise}
              </option>
            ))}
          </select>
          {errors.enterpriseId ? (
            <span className="text-xs text-coral">
              {errors.enterpriseId.message}
            </span>
          ) : null}
        </label>
        <label className="space-y-1 text-sm">
          DB Host
          <input
            className={fieldClass}
            placeholder="127.0.0.1"
            {...register("dbHost")}
          />
          {errors.dbHost ? (
            <span className="text-xs text-coral">{errors.dbHost.message}</span>
          ) : null}
        </label>
        <label className="space-y-1 text-sm">
          DB Port
          <input type="number" className={fieldClass} {...register("dbPort")} />
        </label>
        <label className="space-y-1 text-sm">
          DB User
          <input className={fieldClass} {...register("dbUser")} />
        </label>
        <label className="space-y-1 text-sm">
          DB Password
          <input
            type="password"
            className={fieldClass}
            {...register("dbPassword")}
          />
          {errors.dbPassword ? (
            <span className="text-xs text-coral">
              {errors.dbPassword.message}
            </span>
          ) : null}
        </label>
        <label className="space-y-1 text-sm">
          DB Name
          <input className={fieldClass} {...register("dbName")} />
        </label>
        <label className="space-y-1 text-sm">
          Storage Limit GB
          <input
            type="number"
            step="0.1"
            className={fieldClass}
            {...register("storageLimitGb")}
          />
        </label>
        <label className="flex items-center gap-2 pt-7 text-sm">
          <input type="checkbox" {...register("isActive")} /> Active
        </label>
      </div>
      <Controller
        name="backupFrequency"
        control={control}
        render={({ field }) => (
          <CronExpressionInput value={field.value} onChange={field.onChange} />
        )}
      />
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}