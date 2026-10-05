import React, { useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { base44 } from "@/api/base44Client";


const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  ["link", "image"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  [{ color: [] }],
  [{ align: [] }],
  ["clean"],
];

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 320 }) {
  const modules = useMemo(
    () => ({
      toolbar: {
        container: toolbarOptions,
        handlers: {
          image: function () {
            const quill = this.quill;
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.click();
            input.onchange = async () => {
              const file = input.files[0];
              if (!file) return;
              const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
              const range = quill.getSelection(true) || { index: 0 };
              quill.insertEmbed(range.index, "image", file_url);
              quill.setSelection(range.index + 1);
            };
          },
        },
      },
    }),
    []
  );

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      placeholder={placeholder}
      className="zeni-quill"
      style={{ "--quill-min-height": `${minHeight}px` }}
    />
  );
}