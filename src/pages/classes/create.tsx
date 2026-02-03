import { BaseRecord, HttpError, useBack, useList } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { CreateView } from "@/components/refine-ui/views/create-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import UploadWidget from "@/components/upload-widget.tsx";

import { classSchema } from "@/lib/schema.ts";
import { Subject, User } from "@/types";

// Define the type for form data based on the schema
type ClassFormValues = z.infer<typeof classSchema>;

const MAX_DESCRIPTION_LENGTH = 100;

const ClassesCreate = () => {
  const back = useBack();

  const {
    refineCore: { onFinish, formLoading },
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
    reset,
    setValue,
    watch,
  } = useForm<BaseRecord, HttpError, ClassFormValues>({
    resolver: zodResolver(classSchema),
    refineCoreProps: {
      resource: "classes",
      action: "create",
      redirect: "list",
    },
    defaultValues: {
      status: "active",
    },
  });

  const bannerPublicId = watch("bannerCldPubId");
  const descriptionValue = watch("description") || "";

  // Handle banner upload changes
  const handleBannerChange = (
    value: { url: string; publicId: string } | null,
  ) => {
    setValue("bannerUrl", value?.url || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("bannerCldPubId", value?.publicId || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // Custom submit handler for additional validation or processing
  const handleFormSubmit = async (data: ClassFormValues) => {
    try {
      await onFinish(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: { pageSize: 100 },
  });

  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: "teacher" }],
    pagination: { pageSize: 100 },
  });

  const subjects = subjectsQuery.data?.data || [];
  const teachers = teachersQuery.data?.data || [];

  const isLoading = isSubmitting || formLoading;

  return (
    <CreateView className="class-view">
      <Breadcrumb />

      <h1 className="page-title">Create A Class</h1>

      <div className="intro-row">
        <p>
          Create a new class by providing details such as class name,
          description, subject, teacher, capacity, and status.
        </p>
        <Button onClick={back} variant="outline" disabled={isLoading}>
          Go back
        </Button>
      </div>

      <Separator />

      <div className="my-4 flex items-center">
        <Card className="class-form-card">
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl font-semibold pb-0">
              Fill Class Details
            </CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="mt-7">
            <form
              id="create-class-form"
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-5"
            >
              <FieldGroup>
                {/* Banner Upload */}
                <Controller
                  name="bannerUrl"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="create-class-form-bannerUrl">
                        Banner Image <span className="asterisk">*</span>
                      </FieldLabel>
                      <UploadWidget
                        value={
                          field.value
                            ? {
                                url: field.value,
                                publicId: bannerPublicId ?? "",
                              }
                            : null
                        }
                        onChange={handleBannerChange}
                        disabled={isLoading}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                      {errors.bannerCldPubId && !errors.bannerUrl && (
                        <p className="text-destructive text-sm">
                          {errors.bannerCldPubId.message?.toString()}
                        </p>
                      )}
                    </Field>
                  )}
                />

                {/* Class Name */}
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="create-class-form-name">
                        Class Name <span className="asterisk">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="create-class-form-name"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter class name"
                        autoComplete="off"
                        disabled={isLoading}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Subject and Teacher */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Controller
                    name="subjectId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="create-class-form-subject">
                          Subject <span className="asterisk">*</span>
                        </FieldLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={
                            field.value && field.value !== 0
                              ? field.value.toString()
                              : ""
                          }
                          disabled={isLoading}
                        >
                          <SelectTrigger
                            className="w-full"
                            id="create-class-form-subject"
                            aria-label="Select subject"
                          >
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {subjects.map((subject) => (
                                <SelectItem
                                  key={subject.id}
                                  value={subject.id.toString()}
                                >
                                  {subject.name} ({subject.code})
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="teacherId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="create-class-form-teacher">
                          Teacher <span className="asterisk">*</span>
                        </FieldLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          value={field.value || ""}
                          disabled={isLoading}
                        >
                          <SelectTrigger
                            className="w-full"
                            id="create-class-form-teacher"
                            aria-label="Select teacher"
                          >
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {teachers.map((teacher) => (
                                <SelectItem
                                  key={teacher.id}
                                  value={teacher.id.toString()}
                                >
                                  {teacher.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                {/* Capacity and Status */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Controller
                    name="capacity"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="create-class-form-capacity">
                          Capacity <span className="asterisk">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id="create-class-form-capacity"
                          aria-invalid={fieldState.invalid}
                          placeholder="30"
                          min={1}
                          type="number"
                          autoComplete="off"
                          disabled={isLoading}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="status"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="create-class-form-status">
                          Status <span className="asterisk">*</span>
                        </FieldLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          value={field.value || ""}
                          disabled={isLoading}
                        >
                          <SelectTrigger
                            className="w-full"
                            id="create-class-form-status"
                            aria-label="Select status"
                          >
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                {/* Description */}
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="create-class-form-description">
                        Description <span className="asterisk">*</span>
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          {...field}
                          id="create-class-form-description"
                          placeholder="Brief description about the class"
                          rows={6}
                          className="min-h-24 resize-none"
                          aria-invalid={fieldState.invalid}
                          value={field.value || ""}
                          disabled={isLoading}
                          maxLength={MAX_DESCRIPTION_LENGTH}
                        />
                        <InputGroupAddon align="block-end">
                          <InputGroupText className="tabular-nums">
                            {descriptionValue.length}/{MAX_DESCRIPTION_LENGTH}{" "}
                            characters
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter>
            <Field orientation="horizontal">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isLoading}
              >
                Reset
              </Button>
              <Button
                type="submit"
                form="create-class-form"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Class"}
              </Button>
            </Field>
          </CardFooter>
        </Card>
      </div>
    </CreateView>
  );
};

export default ClassesCreate;
